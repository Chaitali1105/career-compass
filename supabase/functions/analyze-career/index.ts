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
    const prompt = `Analyze this career assessment data and provide detailed career recommendations:

Profile Information:
- Name: ${profile?.full_name || "N/A"}
- Main Skill: ${profile?.main_skill || "N/A"}
- Interest Area: ${profile?.interest_area || "N/A"}
- Goals: ${profile?.goals || "N/A"}
- Academic Performance: ${profile?.marks_percentage || "N/A"}%

Assessment Domain Scores (0-100 scale):
${averageScores.map(s => `- ${s.domain}: ${s.score.toFixed(1)}`).join('\n')}

Based on this data, provide:
1. The dominant career domain (Technology, Business, Art, Music, or Education)
2. A primary career recommendation that best fits this person
3. 3-5 alternative career paths
4. Key skill gaps to address
5. A detailed 5-step roadmap for career development
6. Recommended resources (courses, certifications, books)

Provide detailed, actionable, and personalized advice.`;

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

    // Determine dominant domain
    const sortedScores = averageScores.sort((a, b) => b.score - a.score);
    const dominantDomain = sortedScores[0].domain;

    // Save recommendation to database
    const recommendation = {
      user_id: user.id,
      dominant_domain: dominantDomain,
      primary_career: "AI-Generated Career Path",
      reasoning: aiAnalysis,
      score_breakdown: averageScores,
      alternative_careers: ["Path 1", "Path 2", "Path 3"],
      skill_gaps: ["Skill 1", "Skill 2"],
      roadmap_steps: [
        { step: 1, title: "Foundation", description: "Build core skills" },
        { step: 2, title: "Development", description: "Gain experience" },
        { step: 3, title: "Specialization", description: "Focus on niche" },
        { step: 4, title: "Mastery", description: "Become expert" },
        { step: 5, title: "Leadership", description: "Lead and mentor" },
      ],
      recommended_resources: [],
    };

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
