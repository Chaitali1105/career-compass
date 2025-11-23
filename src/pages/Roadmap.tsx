import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function Roadmap() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<any>(null);

  useEffect(() => {
    const loadRoadmap = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("career_recommendations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setRoadmap(data);
      setLoading(false);
    };

    loadRoadmap();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No Roadmap Available</h2>
              <p className="text-muted-foreground mb-6">Complete the assessment to get your personalized roadmap</p>
              <Button onClick={() => navigate("/assessment/start")}>Take Assessment</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const steps = roadmap.roadmap_steps || [];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Your Career Roadmap</h1>
        <p className="text-lg text-muted-foreground mb-8">Follow these steps to achieve your career goals</p>

        <div className="space-y-6">
          {steps.map((step: any, index: number) => (
            <Card key={index} className="shadow-elegant hover:shadow-glow transition-smooth border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0 shadow-md">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {step.description}
                    </p>
                  </div>
                  {index === 0 && (
                    <Badge variant="secondary" className="shrink-0">Current</Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {roadmap.skill_gaps && roadmap.skill_gaps.length > 0 && (
              <Card className="shadow-md bg-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Skills to Develop
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.skill_gaps.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {roadmap.alternative_careers && roadmap.alternative_careers.length > 0 && (
              <Card className="shadow-md bg-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Alternative Paths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {roadmap.alternative_careers.slice(0, 3).map((career: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{career}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <Button onClick={() => navigate("/analysis")} variant="outline" size="lg" className="flex-1">
              Back to Analysis
            </Button>
            <Button onClick={() => navigate("/colleges")} size="lg" className="flex-1">
              Find Colleges
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
