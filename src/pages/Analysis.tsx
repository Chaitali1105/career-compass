import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, TrendingUp, Target, Lightbulb, BookOpen, Award } from "lucide-react";

export default function Analysis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [userName, setUserName] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", session.user.id)
        .single();

      setUserName(profile?.full_name || "");

      const { data: recommendation } = await supabase
        .from("career_recommendations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recommendation) {
        setAnalysis(recommendation);
        setLoading(false);
      } else {
        // Trigger AI analysis
        setAnalyzing(true);
        const { data, error } = await supabase.functions.invoke("analyze-career");
        
        if (error) {
          toast.error("Error generating analysis");
          setLoading(false);
          setAnalyzing(false);
          return;
        }

        setAnalysis(data.recommendation);
        setLoading(false);
        setAnalyzing(false);
      }
    };

    loadAnalysis();
  }, [navigate]);

  if (loading || analyzing) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">
            {analyzing ? "AI is analyzing your responses..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No Analysis Available</h2>
              <p className="text-muted-foreground mb-6">Please complete the assessment first</p>
              <Button onClick={() => navigate("/assessment/start")}>Take Assessment</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const scoreBreakdown = analysis.score_breakdown || [];
  const skillGaps = analysis.skill_gaps || [];
  const alternativeCareers = analysis.alternative_careers || [];

  // Show only top 5 domains to avoid showing too many 100% scores
  const topScores = scoreBreakdown
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Hi {userName}! 👋</h1>
          <p className="text-lg text-muted-foreground">Here's your personalized career analysis based on your assessment</p>
        </div>

        <div className="grid gap-6 mb-6">
          {/* Primary Career Card */}
          <Card className="shadow-elegant border-primary/20">
            <CardHeader className="bg-gradient-primary text-primary-foreground">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Recommended Career Path</p>
                  <CardTitle className="text-2xl">{analysis.primary_career}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {analysis.dominant_domain}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown - Only show top 5 */}
          {topScores.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle>Your Top Strengths</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {topScores.map((score: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium capitalize">{score.domain}</span>
                      <span className="text-muted-foreground">{Math.round(score.score)}%</span>
                    </div>
                    <Progress value={score.score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Alternative Careers */}
            {alternativeCareers.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <CardTitle>Alternative Paths</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {alternativeCareers.map((career: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm">{career}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Skills to Develop */}
            {skillGaps.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <CardTitle>Skills to Develop</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skillGaps.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detailed Analysis */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <CardTitle>Detailed Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {analysis.reasoning}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => navigate("/roadmap")} size="lg" className="flex-1">
              View Career Roadmap
            </Button>
            <Button onClick={() => navigate("/colleges")} variant="secondary" size="lg" className="flex-1">
              Find Colleges
            </Button>
            <Button onClick={() => navigate("/assessment/start")} variant="outline" size="lg" className="flex-1">
              Retake Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
