import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface Question {
  id: string;
  text: string;
  domain: string;
  order_number: number;
}

export default function AssessmentQuestions() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth/login");
        return;
      }
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from("assessment_questions")
        .select("*")
        .order("order_number");

      if (error) {
        toast.error("Error loading questions");
        return;
      }

      setQuestions(data || []);
      setLoading(false);
    };

    loadQuestions();
  }, [navigate]);

  const handleAnswer = (value: number) => {
    const currentQuestion = questions[currentIndex];
    setAnswers({ ...answers, [currentQuestion.id]: value });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error("Please answer all questions");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare answers data
      const answersData = Object.entries(answers).map(([questionId, value]) => ({
        user_id: userId,
        question_id: questionId,
        answer_value: value,
      }));

      // Use upsert to insert or update answers atomically
      // This avoids race conditions by updating existing records or creating new ones
      const { error } = await supabase
        .from("assessment_answers")
        .upsert(answersData, {
          onConflict: 'user_id,question_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error("Upsert error:", error);
        throw error;
      }

      toast.success("Assessment completed!");
      navigate("/analysis");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Error submitting answers. Please try again.");
      setSubmitting(false);
    }
  };

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

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              {currentQuestion?.text}
            </h2>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((value) => {
                const labels = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
                const isSelected = answers[currentQuestion?.id] === value;
                return (
                  <Button
                    key={value}
                    onClick={() => handleAnswer(value)}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full h-auto py-4 text-left justify-start"
                  >
                    <span className="font-semibold mr-3">{value}</span>
                    <span>{labels[value - 1]}</span>
                  </Button>
                );
              })}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              {currentIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length !== questions.length}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Assessment"
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => setCurrentIndex(currentIndex + 1)} 
                  variant="outline"
                  disabled={!answers[currentQuestion?.id]}
                >
                  Next
                </Button>
              )}
            </div>
            {currentIndex === questions.length - 1 && Object.keys(answers).length !== questions.length && (
              <p className="text-sm text-destructive text-center mt-4">
                Please answer all {questions.length} questions to submit ({Object.keys(answers).length}/{questions.length} completed)
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
