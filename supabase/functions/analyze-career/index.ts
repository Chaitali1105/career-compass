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
      rawAverage: data.total / data.count, // Keep raw average for ranking
    }));
    
    // Sort by raw average first, then by domain name for consistency
    averageScores.sort((a, b) => {
      if (Math.abs(a.rawAverage - b.rawAverage) < 0.1) {
        // If scores are nearly identical, use domain name for consistency
        return a.domain.localeCompare(b.domain);
      }
      return b.rawAverage - a.rawAverage;
    });
    
    // Determine dominant domain using multiple factors
    let dominantDomain = averageScores[0].domain;
    
    // Override with user profile if they specified interests
    const profileKeywords: Record<string, string[]> = {
      "Technology": ["programming", "coding", "tech", "software", "computer", "IT", "developer", "engineer"],
      "Business": ["business", "entrepreneur", "management", "finance", "marketing", "sales", "startup"],
      "Art": ["art", "design", "creative", "painting", "drawing", "visual", "graphic"],
      "Music": ["music", "singing", "instrument", "composer", "producer", "audio"],
      "Education": ["teaching", "education", "tutor", "trainer", "professor", "instructor"],
    };
    
    // Check user profile for domain keywords
    const userText = `${profile?.main_skill || ""} ${profile?.interest_area || ""} ${profile?.goals || ""}`.toLowerCase();
    for (const [domain, keywords] of Object.entries(profileKeywords)) {
      if (keywords.some((keyword: string) => userText.includes(keyword))) {
        dominantDomain = domain;
        console.log(`Override dominant domain to ${domain} based on user profile`);
        break;
      }
    }
    
    // Map assessment domains to career domains
    const domainMapping: Record<string, string> = {
      "analytical": "Technology",
      "technical": "Technology",
      "technology": "Technology",
      "creativity": "Art",
      "artistic": "Art",
      "arts": "Art",
      "musical": "Music",
      "music": "Music",
      "business": "Business",
      "management": "Business",
      "leadership": "Business",
      "education": "Education",
      "teaching": "Education",
      "social": "Education",
    };
    
    // Map the dominant domain
    const mappedDomain = domainMapping[dominantDomain.toLowerCase()] || dominantDomain;
    const finalDomain = mappedDomain;

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
Provide 5-7 specific action items with clear deliverables. Include:
- Exact courses or certifications to pursue
- Specific skills to develop with practice hours
- Projects to complete with detailed descriptions
- Communities or networks to join
- Expected outcomes and milestones

**Step 2: [Months 7-12] - [Growth Phase Name]**
Provide 5-7 specific action items focusing on practical application. Include:
- Internship or entry-level job targets
- Portfolio pieces to create with specifications
- Industry events or conferences to attend
- Mentor relationships to establish
- Measurable skill improvements

**Step 3: [Year 2] - [Specialization Phase Name]**
Provide 5-7 specific action items for deepening expertise. Include:
- Advanced certifications or specialized training
- Complex projects with industry relevance
- Leadership opportunities to pursue
- Professional contributions (articles, talks, workshops)
- Career milestone targets

**Step 4: [Year 3-4] - [Professional Advancement Phase Name]**
Provide 5-7 specific action items for career growth. Include:
- Target job roles and companies
- Industry recognition goals (awards, publications)
- Mentorship and teaching opportunities
- Personal brand development strategies
- Income and responsibility milestones

**Step 5: [Year 5+] - [Mastery & Leadership Phase Name]**
Provide 5-7 specific action items for senior career development. Include:
- Leadership position targets
- Industry influence strategies
- Business or venture opportunities
- Legacy building activities
- Long-term career vision milestones

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

    // Parse AI response to extract structured data

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
        roadmapSteps = generateDefaultRoadmap(finalDomain);
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
      dominant_domain: finalDomain,
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
          { step: 1, title: "Months 1-6: Master Programming Fundamentals", description: "Complete CS50 or FreeCodeCamp courses. Learn Python and JavaScript deeply. Build 5 projects: calculator, to-do app, weather app, portfolio site, and API project. Practice 2 hours daily on coding challenges (LeetCode, HackerRank). Join GitHub and make first open-source contribution. Study data structures and algorithms. Set up development environment with VS Code, Git, and essential tools." },
          { step: 2, title: "Months 7-12: Build Real-World Experience", description: "Apply to 20+ internships at tech companies. Create 3 substantial projects for your portfolio: full-stack web app, mobile app, or data visualization tool. Contribute to 3+ open-source projects regularly. Build professional portfolio website. Network on LinkedIn and Twitter tech. Attend 2 local tech meetups monthly. Start technical blog and write 5 articles. Learn database management (SQL, MongoDB)." },
          { step: 3, title: "Year 2: Specialize and Certify", description: "Choose specialization: Web Development (React, Node), Data Science (Python, ML), Cloud (AWS, Azure), or Mobile (React Native, Flutter). Complete 2-3 industry certifications. Build 3 advanced projects in your specialization. Secure junior developer position or quality internship. Join specialized communities (r/webdev, data science forums). Attend 1 major tech conference. Master advanced tools in your domain. Start freelancing for experience." },
          { step: 4, title: "Years 3-4: Establish Professional Presence", description: "Target mid-level developer positions at growing companies. Lead 2-3 technical projects at work. Mentor junior developers or interns. Speak at 2 local meetups or conferences. Contribute to technical documentation. Build side project with real users. Expand LinkedIn to 500+ connections. Write 10 technical articles. Consider master's degree or specialized bootcamp. Earn $60-80K+ annually." },
          { step: 5, title: "Years 5+: Leadership and Innovation", description: "Apply for senior developer or tech lead roles. Architect large-scale systems. Mentor team of 3-5 developers. Speak at major conferences (2+ times). Launch successful side product or startup. Build personal brand with 10K+ followers. Earn $100K+ annually. Consider VP Engineering or CTO path. Create online courses or write technical book. Give back through open-source leadership." }
        ],
        "Business": [
          { step: 1, title: "Months 1-6: Business Fundamentals & Tools", description: "Complete business courses: Accounting, Marketing, Finance, Operations Management. Master Excel (pivot tables, VLOOKUP, financial modeling). Learn Google Analytics and basic SQL. Study 10 successful business case studies. Join business student organizations. Read 5 business books (Good to Great, Blue Ocean Strategy, etc.). Complete HubSpot Marketing or Google Analytics certification. Develop professional LinkedIn profile. Network with 50+ business professionals. Create business plan for hypothetical venture." },
          { step: 2, title: "Months 7-12: Practical Experience & Specialization", description: "Secure internship at established company or startup. Lead 2 student organization projects. Attend 3 industry networking events. Choose specialization: Marketing, Finance, Operations, or Entrepreneurship. Complete 3 real-world business analyses. Learn PowerBI or Tableau for data visualization. Shadow executives in your target industry. Build professional network of 200+ on LinkedIn. Start personal brand with 5 thought leadership posts. Learn CRM systems (Salesforce basics)." },
          { step: 3, title: "Year 2: Professional Development & Certification", description: "Pursue relevant certifications: PMP (Project Management), Google Analytics, HubSpot, or CFA Level 1. Secure entry-level business role. Lead 2-3 significant projects at work. Master industry-specific software. Build portfolio of business achievements. Attend major industry conference. Join professional associations (AMA, PMI, etc.). Mentor junior colleagues or students. Write 5 industry articles or case studies. Expand network to 500+ professionals. Target $45-60K salary." },
          { step: 4, title: "Years 3-4: Management & Strategic Roles", description: "Target manager or senior analyst positions. Lead team of 3-5 people. Manage budget of $500K+. Complete MBA or executive education program. Drive 2 major strategic initiatives. Speak at 2 industry events. Build reputation in specific domain. Launch side consulting or business. Mentor 3+ professionals. Publish 10 thought leadership pieces. Achieve $70-90K compensation. Develop C-suite relationships." },
          { step: 5, title: "Years 5+: Leadership & Entrepreneurship", description: "Target director-level or VP positions. Manage multi-million dollar P&L. Lead teams of 15+ people. Start own consulting firm or business venture. Serve on advisory boards. Speak at major conferences regularly. Build 5,000+ professional network. Earn $120K+ total compensation. Consider C-suite path (CMO, CFO, COO). Mentor emerging leaders. Write business book or create executive course. Develop passive income streams. Make strategic angel investments." }
        ],
        "Art": [
          { step: 1, title: "Months 1-6: Foundation & Portfolio Building", description: "Practice art 3+ hours daily with structured exercises. Study fundamentals: anatomy, perspective, color theory, composition. Complete 30-day drawing challenge. Build initial portfolio with 25+ quality pieces. Learn art history and study 20 master artists. Join local art communities or groups. Take 2 online courses (Skillshare, Domestika, New Masters Academy). Set up Instagram art account. Create basic portfolio website. Study copyright and licensing basics." },
          { step: 2, title: "Months 7-12: Technical Skills & First Clients", description: "Master design software: Adobe Creative Suite (Photoshop, Illustrator, InDesign) or alternatives. Learn Figma for UI/UX or Blender for 3D. Complete 10 commissioned pieces for friends/family. Build portfolio to 40+ diverse pieces. Share work daily on Instagram and ArtStation. Enter 5 art competitions or juried shows. Network with 100+ artists online. Do first paid freelance projects. Learn basic business skills (invoicing, contracts). Study successful artists' career paths." },
          { step: 3, title: "Year 2: Brand Development & Specialization", description: "Choose specialization: Illustration, Graphic Design, UI/UX, Fine Art, 3D, or Animation. Create professional portfolio website with 50+ best works. Grow Instagram to 5,000+ followers with consistent posting. Freelance regularly with 15+ paid projects. Apply to design studios, agencies, or galleries. Exhibit work in 2 local shows or online galleries. Collaborate with 3+ other creatives. Create print-on-demand products (Redbubble, Society6). Join professional organizations (AIGA, local art councils). Master advanced techniques in specialization." },
          { step: 4, title: "Years 3-4: Professional Growth & Revenue", description: "Secure full-time position at studio/agency or establish strong freelance business. Complete 50+ professional projects. Build client base of 20+ recurring customers. Earn $50-70K annually from art. Show work in 5+ exhibitions. Grow following to 20K+ across platforms. Launch online shop or Patreon with $500+ monthly. Teach 2 workshops or online courses. Speak at 2 creative events. Build professional network of 500+. Enter major competitions. Develop signature style." },
          { step: 5, title: "Years 5+: Mastery & Business Leadership", description: "Become senior designer, art director, or successful independent artist. Earn $80K+ from multiple art income streams. Lead creative teams or run own studio. Exhibit in major galleries or museums. Grow audience to 100K+ across platforms. Teach regular workshops and online courses. Publish art book or create major NFT collection. Commission work for major brands. Mentor emerging artists. Build passive income through prints, products, licensing. Speak at major conferences. Consider opening own gallery or school." }
        ],
        "Music": [
          { step: 1, title: "Months 1-6: Foundation & Technical Skills", description: "Practice instrument/voice 3+ hours daily with structured routine. Complete music theory course (Berklee Online or local conservatory). Learn 20+ songs in your genre. Record 10 quality demos in home setup. Study 5 music production tutorials weekly. Master basic DAW (GarageBand or free version of Pro Tools). Join local music community or ensemble. Study successful artists in your genre. Set up social media presence. Create simple EPK (Electronic Press Kit)." },
          { step: 2, title: "Months 7-12: Performance & Audience Building", description: "Perform 2-3 times monthly at open mics, cafes, and small venues. Collaborate with 3+ local musicians on projects. Launch YouTube channel with 12 quality videos (covers and originals). Record first professional EP (4-5 songs) in studio. Build Instagram following to 1,000+ with consistent content. Create TikTok presence with music snippets. Network with 50+ music industry people. Book first paid gigs. Join musician communities online. Study live performance techniques." },
          { step: 3, title: "Year 2: Professional Development & Production", description: "Invest in home studio: quality interface, microphone, monitors, DAW (Logic Pro, Ableton, FL Studio). Master music production with 100+ hours of practice. Release first full album independently. Perform 20+ paid shows. Grow social following to 5,000+. Collaborate with established artists. Study mixing and mastering. Submit to music blogs and playlists. Book shows in 3+ cities. Earn first $10K from music. Consider music business courses. Build professional website." },
          { step: 4, title: "Years 3-4: Career Establishment & Revenue", description: "Release music on all platforms (Spotify, Apple Music, YouTube Music). Target 50K+ streams per release. Perform 40+ shows annually including festivals. Build email list of 1,000+ fans. Develop merchandise line. Secure music sync deals for TV/film. Teach 10+ private students weekly or online courses. Collaborate with brands for sponsorships. Apply to music grants and artist programs. Gross $40-60K annually from multiple music revenue streams. Work with booking agent or manager." },
          { step: 5, title: "Years 5+: Mastery & Diversification", description: "Headline shows and tour regionally/nationally. Release 2+ projects annually maintaining quality. Build loyal fanbase of 100K+ across platforms. Earn $80K+ from music: performances, streaming, teaching, sync licensing, merchandise. Start your own label or production company. Mentor emerging artists. Score films, games, or commercials regularly. Host workshops and masterclasses. Develop passive income through sample packs, presets, online courses. Consider opening recording studio or music school." }
        ],
        "Education": [
          { step: 1, title: "Months 1-6: Teaching Foundations & Experience", description: "Volunteer as tutor for 10+ students. Complete education fundamentals course. Study pedagogy and learning theories (Bloom's Taxonomy, multiple intelligences). Observe 20+ hours of master teachers. Develop 10 lesson plans in your subject. Join teaching communities (r/teachers, local education groups). Read 5 education books (Teach Like a Champion, etc.). Learn classroom management strategies. Practice public speaking. Understand child development psychology." },
          { step: 2, title: "Months 7-12: Practical Teaching & Skills", description: "Work as teaching assistant or substitute teacher. Complete 100+ hours of classroom instruction. Teach after-school program or summer camp. Develop curriculum for specific subject/grade. Master 5 ed-tech tools (Google Classroom, Kahoot, Nearpod). Create engaging teaching materials and resources. Study differentiated instruction techniques. Attend 3 education conferences or workshops. Network with 50+ educators. Begin teacher certification program or education degree." },
          { step: 3, title: "Year 2: Certification & Specialization", description: "Complete B.Ed or teaching certification program. Pass required licensing exams. Secure first teaching position. Teach 150+ students successfully. Develop expertise in subject area or grade level. Get specialized certifications (ESL, Special Ed, Gifted). Master assessment and grading strategies. Implement project-based learning. Join professional teaching associations. Lead extracurricular activity or club. Integrate technology effectively. Build reputation in school community." },
          { step: 4, title: "Years 3-4: Professional Development & Leadership", description: "Become experienced teacher with strong student outcomes. Lead department meetings or grade-level teams. Mentor 2-3 new teachers. Pursue M.Ed or specialized graduate degree. Present at education conferences. Develop innovative curriculum or teaching methods. Write education blog or create teaching resources. Learn data-driven instruction. Serve on school committees. Build professional network of 200+ educators. Earn $50-65K depending on location. Consider National Board Certification." },
          { step: 5, title: "Years 5+: Leadership & Educational Impact", description: "Move into instructional coach, department head, assistant principal, or principal role. Launch tutoring center or education startup. Create online courses serving 1,000+ students. Become education consultant or curriculum developer. Earn $70-100K+ in leadership roles. Lead professional development for teachers. Write education book or create teacher training program. Speak at major education conferences. Influence education policy. Mentor emerging educational leaders. Build legacy of educational innovation and student success." }
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
