import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ClipboardList, Map, GraduationCap, Sparkles, Brain, BookOpen, Users, CheckCircle2, Target, TrendingUp, BarChart3 } from "lucide-react";

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
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personalized career guidance dashboard - Track your progress and explore opportunities
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-lg hover:shadow-xl transition-smooth border-l-4 border-l-primary">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-3 shadow-glow">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Career Assessment</CardTitle>
              <CardDescription className="text-base">
                {hasCompletedAssessment
                  ? "Retake the assessment to refine your career recommendations"
                  : "Take our comprehensive 20-question assessment to discover your ideal career path"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/assessment/start")}
                className="w-full"
                size="lg"
                variant={hasCompletedAssessment ? "outline" : "default"}
              >
                {hasCompletedAssessment ? "Retake Assessment" : "Start Assessment"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              {hasCompletedAssessment && (
                <Badge className="w-full mt-3 justify-center" variant="secondary">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Completed
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-smooth border-l-4 border-l-secondary">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-secondary rounded-xl flex items-center justify-center mb-3 shadow-glow">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">AI Analysis</CardTitle>
              <CardDescription className="text-base">
                View your detailed career analysis with personalized insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/analysis")}
                variant="outline"
                size="lg"
                className="w-full"
              >
                View Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-smooth border-l-4 border-l-accent">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center mb-3 shadow-glow">
                <Map className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Career Roadmap</CardTitle>
              <CardDescription className="text-base">
                Access your detailed 5-year career development plan with actionable milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/roadmap")}
                variant="outline"
                size="lg"
                className="w-full"
              >
                View Roadmap
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="shadow-md hover:shadow-lg transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Find Colleges</h4>
                    <p className="text-sm text-muted-foreground">Explore colleges matching your career domain</p>
                  </div>
                </div>
                <Button onClick={() => navigate("/colleges")} variant="ghost" size="sm">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Your Profile</h4>
                    <p className="text-sm text-muted-foreground">Update your information and preferences</p>
                  </div>
                </div>
                <Button onClick={() => navigate("/profile")} variant="ghost" size="sm">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">What You Get with CareerPath</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="shadow-md text-center">
              <CardContent className="pt-6 pb-6">
                <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold mb-2">AI-Powered Insights</h4>
                <p className="text-sm text-muted-foreground">Advanced algorithms analyze your unique profile</p>
              </CardContent>
            </Card>

            <Card className="shadow-md text-center">
              <CardContent className="pt-6 pb-6">
                <div className="w-14 h-14 bg-gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold mb-2">Personalized Plans</h4>
                <p className="text-sm text-muted-foreground">Detailed roadmaps tailored to your goals</p>
              </CardContent>
            </Card>

            <Card className="shadow-md text-center">
              <CardContent className="pt-6 pb-6">
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold mb-2">Learning Resources</h4>
                <p className="text-sm text-muted-foreground">Curated courses and materials for your path</p>
              </CardContent>
            </Card>

            <Card className="shadow-md text-center">
              <CardContent className="pt-6 pb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold mb-2">Career Growth</h4>
                <p className="text-sm text-muted-foreground">Track progress and achieve milestones</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        {!hasCompletedAssessment && (
          <Card className="bg-gradient-to-br from-primary to-primary/90 text-white shadow-2xl">
            <CardContent className="p-10 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-4">Ready to Discover Your Perfect Career?</h3>
              <p className="text-lg mb-6 opacity-95 max-w-2xl mx-auto">
                Take our comprehensive AI-powered assessment to get personalized career recommendations,
                a detailed development roadmap, and college suggestions tailored just for you.
              </p>
              <Button
                onClick={() => navigate("/assessment/start")}
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
              >
                Start Your Career Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
