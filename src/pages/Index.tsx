import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, ArrowRight, Sparkles, Target, TrendingUp, Brain, BookOpen, Users, CheckCircle2 } from "lucide-react";

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
          <Card className="shadow-lg hover:shadow-xl transition-smooth">
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">Advanced algorithms analyze your unique profile, skills, and interests for highly accurate career recommendations</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-smooth">
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Personalized Roadmap</h3>
              <p className="text-muted-foreground">Get a comprehensive 5-year career development plan with specific action items and milestones</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-smooth">
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">College Matching</h3>
              <p className="text-muted-foreground">Discover colleges that align perfectly with your career path and location preferences</p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="py-16 bg-card rounded-3xl shadow-lg mb-16">
          <div className="text-center mb-12 px-4">
            <h2 className="text-4xl font-bold mb-4">How CareerPath Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to discover your ideal career path
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 px-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-primary/30">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-bold text-lg mb-2">Create Profile</h4>
              <p className="text-sm text-muted-foreground">Share your skills, interests, academic background, and career goals</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-primary/30">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-bold text-lg mb-2">Take Assessment</h4>
              <p className="text-sm text-muted-foreground">Complete our comprehensive career aptitude quiz covering multiple domains</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-primary/30">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-bold text-lg mb-2">Get AI Analysis</h4>
              <p className="text-sm text-muted-foreground">Receive personalized career recommendations powered by advanced AI</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-primary/30">
                <span className="text-3xl font-bold text-primary">4</span>
              </div>
              <h4 className="font-bold text-lg mb-2">Follow Roadmap</h4>
              <p className="text-sm text-muted-foreground">Execute your detailed career development plan with clear milestones</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive career guidance tools all in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Skill Gap Analysis</h4>
                    <p className="text-sm text-muted-foreground">Identify areas for improvement and get actionable recommendations to develop missing skills</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Curated Resources</h4>
                    <p className="text-sm text-muted-foreground">Access tailored learning materials, courses, and resources for your specific career path</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Alternative Careers</h4>
                    <p className="text-sm text-muted-foreground">Explore 5+ alternative career paths that match your skills and interests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Step-by-Step Guidance</h4>
                    <p className="text-sm text-muted-foreground">Clear, actionable steps with timelines to help you achieve your career goals systematically</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center">
          <Card className="shadow-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Career?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of students and professionals who have discovered their perfect career path with CareerPath
              </p>
              <Button size="lg" onClick={() => navigate("/auth/register")} className="text-lg px-10 py-6">
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
