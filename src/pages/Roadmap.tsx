import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoadmapCard from "./RoadmapCard";

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
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">No Roadmap Available</h2>
            <p className="text-muted-foreground mb-6">Complete the assessment to get your personalized roadmap</p>
            <Button onClick={() => navigate("/assessment/start")}>Take Assessment</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Your Career Roadmap</h1>
          <p className="text-lg text-muted-foreground">Follow these steps to achieve your career goals</p>
        </div>

        <RoadmapCard roadmap={roadmap} />

        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={() => navigate("/analysis")} variant="outline" size="lg">
            Back to Analysis
          </Button>
          <Button onClick={() => navigate("/colleges")} size="lg">
            Find Colleges
          </Button>
        </div>
      </div>
    </div>
  );
}
