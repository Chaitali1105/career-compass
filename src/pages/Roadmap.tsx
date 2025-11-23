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
            <Card key={index} className="shadow-md">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {step.step}
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}

          {roadmap.skill_gaps && roadmap.skill_gaps.length > 0 && (
            <Card className="shadow-md bg-accent/10">
              <CardHeader>
                <CardTitle>Skills to Develop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {roadmap.skill_gaps.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
