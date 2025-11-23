import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Hi {userName}! 👋</h1>
        <p className="text-lg text-muted-foreground mb-8">Here's your personalized career analysis</p>

        <div className="space-y-6">
          <Card className="shadow-lg border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Your Dominant Domain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary capitalize">{analysis.dominant_domain}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Recommended Primary Career</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold mb-4">{analysis.primary_career}</div>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {analysis.reasoning}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => navigate("/roadmap")} className="flex-1">
              View Roadmap <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button onClick={() => navigate("/assessment/start")} variant="outline" className="flex-1">
              Retake Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
