import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Fetch user's answers
    const { data: answers } = await supabase
      .from("assessment_answers")
      .select("*, assessment_questions(*)")
      .eq("user_id", user.id);

    if (!answers || answers.length === 0) {
      return new Response(JSON.stringify({ error: "No assessment data found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate domain scores
    const domainScores: Record<string, { total: number; count: number }> = {};
    
    answers.forEach((answer: any) => {
      const domain = answer.assessment_questions.domain;
      if (!domainScores[domain]) {
        domainScores[domain] = { total: 0, count: 0 };
      }
      domainScores[domain].total += answer.answer_value;
      domainScores[domain].count += 1;
    });

    const averageScores = Object.entries(domainScores).map(([domain, data]) => ({
      domain,
      score: (data.total / data.count / 5) * 100, // Normalize to 100
    }));

    // Prepare prompt for AI
    const prompt = `You are an expert career counselor. Analyze this assessment and provide HIGHLY SPECIFIC career guidance.

Profile Information:
- Name: ${profile?.full_name || "N/A"}
- Main Skill: ${profile?.main_skill || "N/A"}
- Interest Area: ${profile?.interest_area || "N/A"}
- Goals: ${profile?.goals || "N/A"}
- Academic Performance: ${profile?.marks_percentage || "N/A"}%

Assessment Domain Scores (0-100 scale):
${averageScores.map(s => `- ${s.domain}: ${s.score.toFixed(1)}`).join('\n')}

CRITICAL: Even if scores are similar, you MUST identify ONE dominant strength based on:
1. The highest scoring domain
2. The user's stated interests and goals
3. Create clear differentiation in your analysis

Provide your response in this EXACT format:

### Primary Career Recommendation: **[Specific Job Title]**

[2-3 paragraphs explaining this specific career and why it fits]

### Alternative Career Paths:

1. **[Job Title 1]** - [One sentence why this fits]
2. **[Job Title 2]** - [One sentence why this fits]
3. **[Job Title 3]** - [One sentence why this fits]
4. **[Job Title 4]** - [One sentence why this fits]
5. **[Job Title 5]** - [One sentence why this fits]

### Skill Gaps to Address:

1. **[Skill 1]**: [How to develop it]
2. **[Skill 2]**: [How to develop it]
3. **[Skill 3]**: [How to develop it]
4. **[Skill 4]**: [How to develop it]
5. **[Skill 5]**: [How to develop it]

### Roadmap for Career Development:

**Step 1: [Months 1-6] - [Foundation Phase Name]**
[Detailed action items with specific tasks and expected outcomes]

**Step 2: [Months 7-12] - [Growth Phase Name]**
[Detailed action items with specific tasks and expected outcomes]

**Step 3: [Year 2] - [Specialization Phase Name]**
[Detailed action items with specific tasks and expected outcomes]

**Step 4: [Year 3] - [Professional Phase Name]**
[Detailed action items with specific tasks and expected outcomes]

**Step 5: [Year 4+] - [Leadership Phase Name]**
[Detailed action items with specific tasks and expected outcomes]

### Recommended Resources:

- **[Resource 1]** - [Platform/Provider]
- **[Resource 2]** - [Platform/Provider]
- **[Resource 3]** - [Platform/Provider]
- **[Resource 4]** - [Platform/Provider]
- **[Resource 5]** - [Platform/Provider]

IMPORTANT: Be specific, actionable, and create clear distinctions even when scores are similar.`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert career counselor. Provide detailed, actionable career guidance in a structured format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI request failed");
    }

    const aiData = await aiResponse.json();
    const aiAnalysis = aiData.choices[0].message.content;

    // Determine dominant domain and map to career domain
    const sortedScores = averageScores.sort((a, b) => b.score - a.score);
    const topDomain = sortedScores[0].domain;
    
    // Map assessment domains to career domains for college matching
    const domainMapping: Record<string, string> = {
      "analytical": "Technology",
      "technical": "Technology",
      "technology": "Technology",
      "creativity": "Art",
      "artistic": "Art",
      "musical": "Music",
      "business": "Business",
      "management": "Business",
      "leadership": "Business",
      "education": "Education",
      "teaching": "Education",
      "social": "Education",
    };
    
    const dominantDomain = domainMapping[topDomain.toLowerCase()] || "Technology";

    // Parse AI response to extract structured data
    let primaryCareer = "AI-Generated Career Path";
    let alternativeCareers: string[] = [];
    let skillGaps: string[] = [];
    let roadmapSteps: any[] = [];
    let resources: string[] = [];
    
    try {
      // Extract primary career
      const careerMatch = aiAnalysis.match(/Primary Career Recommendation:\s*\*\*(.+?)\*\*/i);
      if (careerMatch) primaryCareer = careerMatch[1].trim();
      
      // Extract alternative careers (look for numbered lists)
      const altCareersSection = aiAnalysis.match(/Alternative Career Paths?:(.+?)(?=###|$)/is);
      if (altCareersSection) {
        const careers = altCareersSection[1].match(/\d+\.\s*\*\*(.+?)\*\*/g);
        if (careers) {
          alternativeCareers = careers.map((c: string) => c.replace(/\d+\.\s*\*\*|\*\*/g, '').trim()).slice(0, 5);
        }
      }
      
      // Extract skill gaps
      const skillGapsSection = aiAnalysis.match(/Skill Gaps?(.+?)(?=###|$)/is);
      if (skillGapsSection) {
        const skills = skillGapsSection[1].match(/\d+\.\s*\*\*(.+?)\*\*/g);
        if (skills) {
          skillGaps = skills.map((s: string) => s.replace(/\d+\.\s*\*\*|\*\*/g, '').trim().split(':')[0]);
        }
      }
      
      // Extract roadmap steps - look for "Step X:" pattern
      const roadmapSection = aiAnalysis.match(/Roadmap for Career Development:(.+?)(?=###|$)/is);
      if (roadmapSection) {
        const steps = roadmapSection[1].match(/\*\*Step \d+:(.+?)\*\*(.+?)(?=\*\*Step|\n\n###|$)/gis);
        if (steps && steps.length > 0) {
          roadmapSteps = steps.map((stepText: string, index: number) => {
            const titleMatch = stepText.match(/\*\*Step \d+:\s*(.+?)\*\*/i);
            const title = titleMatch ? titleMatch[1].trim() : `Step ${index + 1}`;
            const description = stepText.replace(/\*\*Step \d+:.+?\*\*/i, '').trim().substring(0, 300);
            
            return {
              step: index + 1,
              title,
              description
            };
          }).slice(0, 6);
        }
      }
      
      // If no roadmap steps found, use defaults based on domain
      if (roadmapSteps.length === 0) {
        roadmapSteps = generateDefaultRoadmap(dominantDomain);
      }
      
      // Extract resources
      const resourcesSection = aiAnalysis.match(/Recommended Resources:(.+?)$/is);
      if (resourcesSection) {
        const links = resourcesSection[1].match(/\*\s*\*\*(.+?)\*\*/g);
        if (links) {
          resources = links.map((l: string) => l.replace(/\*\s*\*\*|\*\*/g, '').trim()).slice(0, 10);
        }
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      roadmapSteps = generateDefaultRoadmap(dominantDomain);
    }

    // Save recommendation to database
    const recommendation = {
      user_id: user.id,
      dominant_domain: dominantDomain,
      primary_career: primaryCareer,
      reasoning: aiAnalysis,
      score_breakdown: averageScores,
      alternative_careers: alternativeCareers.length > 0 ? alternativeCareers : ["Explore related fields", "Consider interdisciplinary roles", "Look into emerging careers"],
      skill_gaps: skillGaps.length > 0 ? skillGaps : ["Technical proficiency", "Industry knowledge", "Practical experience"],
      roadmap_steps: roadmapSteps,
      recommended_resources: resources,
    };
    
    function generateDefaultRoadmap(domain: string) {
      const roadmaps: Record<string, any[]> = {
        "Technology": [
          { step: 1, title: "Master Programming Fundamentals", description: "Learn Python, JavaScript, or Java. Complete online courses and build 3-5 personal projects. Focus on data structures and algorithms." },
          { step: 2, title: "Gain Practical Experience", description: "Apply for internships at tech companies. Contribute to open-source projects on GitHub. Build a portfolio website showcasing your work." },
          { step: 3, title: "Specialize in Your Domain", description: "Choose between Web Development, Data Science, AI/ML, Mobile Development, or Cloud Computing. Earn relevant certifications (AWS, Google Cloud, etc.)." },
          { step: 4, title: "Build Professional Network", description: "Attend tech meetups and conferences. Connect with professionals on LinkedIn. Join online communities and forums in your specialization." },
          { step: 5, title: "Advance Your Career", description: "Apply for mid-level positions. Lead technical projects. Consider pursuing advanced degrees or specialized certifications. Start mentoring junior developers." }
        ],
        "Business": [
          { step: 1, title: "Build Business Acumen", description: "Study business fundamentals: finance, marketing, operations. Complete courses in business analytics and strategy. Learn Excel and business intelligence tools." },
          { step: 2, title: "Gain Industry Experience", description: "Intern at companies in your target industry. Take on leadership roles in student organizations. Work on real business cases and projects." },
          { step: 3, title: "Develop Specialization", description: "Choose your focus: Marketing, Finance, Operations, HR, or Entrepreneurship. Pursue relevant certifications (PMP, CFA, Google Analytics, etc.)." },
          { step: 4, title: "Expand Your Network", description: "Join professional associations. Attend industry conferences. Build relationships with mentors and peers. Engage on LinkedIn regularly." },
          { step: 5, title: "Step Into Leadership", description: "Target management positions. Lead cross-functional teams. Consider MBA or executive education. Start your own venture or consultancy." }
        ],
        "Art": [
          { step: 1, title: "Master Artistic Fundamentals", description: "Practice drawing, painting, digital art, or your chosen medium daily. Study art history and theory. Build a diverse portfolio of 20+ pieces." },
          { step: 2, title: "Develop Technical Skills", description: "Learn design software: Adobe Creative Suite, Figma, Blender, etc. Take courses in your specialization. Create commissioned work for friends and family." },
          { step: 3, title: "Build Your Brand", description: "Create an online portfolio website. Share work on Instagram, Behance, ArtStation. Participate in art exhibitions and competitions." },
          { step: 4, title: "Gain Commercial Experience", description: "Freelance for clients. Apply to design studios or agencies. Collaborate with other creatives. Build case studies of your best projects." },
          { step: 5, title: "Establish Your Career", description: "Become a senior designer or creative director. Teach workshops. Sell your art. Consider opening your own studio or gallery." }
        ],
        "Music": [
          { step: 1, title: "Build Musical Foundation", description: "Practice your instrument 2+ hours daily. Learn music theory and composition. Record 5-10 original pieces or covers." },
          { step: 2, title: "Gain Performance Experience", description: "Perform at local venues, open mics, and events. Collaborate with other musicians. Create a YouTube channel or streaming presence." },
          { step: 3, title: "Learn Music Technology", description: "Master DAWs (Logic Pro, Ableton, FL Studio). Study audio engineering and production. Build a home studio setup." },
          { step: 4, title: "Build Your Audience", description: "Release music on Spotify, Apple Music, SoundCloud. Grow social media following. Network with industry professionals and producers." },
          { step: 5, title: "Professionalize Your Career", description: "Sign with a label or remain independent. Tour regionally/nationally. Teach music lessons. Compose for media (films, games, ads)." }
        ],
        "Education": [
          { step: 1, title: "Build Teaching Foundations", description: "Volunteer as a tutor. Complete education courses or teacher training. Learn pedagogy and classroom management techniques." },
          { step: 2, title: "Gain Classroom Experience", description: "Work as a teaching assistant. Intern at schools or educational NGOs. Develop lesson plans and teaching materials." },
          { step: 3, title: "Obtain Certifications", description: "Complete teaching certification programs. Pursue B.Ed or M.Ed degrees. Get specialized certifications (TESOL, Special Education, etc.)." },
          { step: 4, title: "Specialize and Innovate", description: "Focus on a subject area or age group. Learn ed-tech tools and online teaching. Develop innovative teaching methodologies." },
          { step: 5, title: "Advance in Education", description: "Move into senior teacher, department head, or principal roles. Pursue educational leadership. Start your own tutoring center or ed-tech venture." }
        ]
      };
      
      return roadmaps[domain] || roadmaps["Technology"];
    }

    // Delete existing recommendation
    await supabase
      .from("career_recommendations")
      .delete()
      .eq("user_id", user.id);

    // Insert new recommendation
    const { error: insertError } = await supabase
      .from("career_recommendations")
      .insert(recommendation);

    if (insertError) {
      console.error("Error saving recommendation:", insertError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      recommendation: {
        ...recommendation,
        ai_analysis: aiAnalysis,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
