import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, CheckCircle2, Clock, Sparkles } from "lucide-react";

export default function AssessmentStart() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 bg-gradient-primary rounded-2xl items-center justify-center mb-4 shadow-glow">
            <ClipboardList className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Career Assessment</h1>
          <p className="text-xl text-muted-foreground">
            Discover your ideal career path through our AI-powered assessment
          </p>
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">What to Expect</CardTitle>
            <CardDescription>
              Our assessment is designed to understand your unique strengths and interests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">20 Carefully Selected Questions</h3>
                <p className="text-muted-foreground">
                  Each question is designed to evaluate different aspects of your personality and interests
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">5 Minutes to Complete</h3>
                <p className="text-muted-foreground">
                  Quick and easy - rate each statement on a scale of 1 to 5
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">AI-Powered Analysis</h3>
                <p className="text-muted-foreground">
                  Our advanced AI analyzes your responses to provide personalized career recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-hero text-white shadow-glow">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Begin?</h3>
            <p className="mb-6 opacity-90">
              Answer honestly for the most accurate recommendations
            </p>
            <Button
              onClick={() => navigate("/assessment/questions")}
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8"
            >
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
