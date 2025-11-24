import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ClipboardList, Map, GraduationCap, Sparkles } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth/login");
        return;
      }

      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!profile) {
        navigate("/profile-setup");
        return;
      }

      setUserName(profile.full_name);

      // Check if user has completed assessment
      const { data: answers } = await supabase
        .from("assessment_answers")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1);

      setHasCompletedAssessment(!!answers && answers.length > 0);
      setLoading(false);
    };

    loadUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Let's continue your journey to finding the perfect career path
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-smooth border-l-4 border-l-primary">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-2">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Career Assessment</CardTitle>
              <CardDescription>
                {hasCompletedAssessment
                  ? "Retake the 20-question assessment to refine your results"
                  : "Take our 20-question assessment to discover your ideal career path"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/assessment/start")}
                className="w-full"
                variant={hasCompletedAssessment ? "outline" : "default"}
              >
                {hasCompletedAssessment ? "Retake Assessment" : "Start Assessment"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-smooth border-l-4 border-l-secondary">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-2">
                <Map className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Career Roadmap</CardTitle>
              <CardDescription>
                View your personalized career development plan and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/roadmap")}
                variant="outline"
                className="w-full"
              >
                View Roadmap
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-smooth border-l-4 border-l-accent">
            <CardHeader>
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-2">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Nearby Colleges</CardTitle>
              <CardDescription>
                Explore colleges in your area that match your career interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/colleges")}
                variant="outline"
                className="w-full"
              >
                Explore Colleges
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {!hasCompletedAssessment && (
          <div className="mt-8">
            <Card className="bg-gradient-primary text-white shadow-glow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Sparkles className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Get Started with Your Assessment</h3>
                    <p className="mb-4 opacity-90">
                      Our AI-powered assessment analyzes your skills, interests, and goals to provide
                      personalized career recommendations. It only takes 5 minutes!
                    </p>
                    <Button
                      onClick={() => navigate("/assessment/start")}
                      variant="secondary"
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      Begin Assessment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
