import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Sparkles, Target, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl">CareerPath</span>
          </div>
          <div className="space-x-3">
            <Button variant="ghost" onClick={() => navigate("/auth/login")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth/register")}>Get Started</Button>
          </div>
        </nav>

        <div className="py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Discover Your Perfect
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Career Path</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered career guidance system that analyzes your skills, interests, and goals to provide personalized recommendations
          </p>
          <Button size="lg" onClick={() => navigate("/auth/register")} className="text-lg px-8">
            Start Your Journey
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 py-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI-Powered Analysis</h3>
            <p className="text-muted-foreground">Advanced algorithms analyze your unique profile for accurate recommendations</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Personalized Roadmap</h3>
            <p className="text-muted-foreground">Get a detailed step-by-step plan tailored to your career goals</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">College Matching</h3>
            <p className="text-muted-foreground">Find the best colleges in your area that match your interests</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
