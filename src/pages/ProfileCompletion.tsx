import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { Loader2 } from "lucide-react";

export default function ProfileCompletion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    marks_percentage: "",
    main_skill: "",
    interest_area: "",
    goals: "",
    hobbies: "",
    daily_habits: "",
    location_city: "",
    location_state: "",
  });

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth/login");
        return;
      }
      
      setUserId(session.user.id);

      // Check if profile already exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profile) {
        navigate("/dashboard");
      }
    };

    checkProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("profiles").insert({
        user_id: userId,
        ...formData,
        marks_percentage: formData.marks_percentage ? parseFloat(formData.marks_percentage) : null,
      });

      if (error) throw error;

      toast.success("Profile created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Error creating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-3xl mx-auto p-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Tell us about yourself to get personalized career recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marks_percentage">Academic Percentage</Label>
                  <Input
                    id="marks_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.marks_percentage}
                    onChange={(e) => setFormData({ ...formData, marks_percentage: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="main_skill">Main Skill</Label>
                  <Input
                    id="main_skill"
                    placeholder="e.g., Programming, Music, Design"
                    value={formData.main_skill}
                    onChange={(e) => setFormData({ ...formData, main_skill: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest_area">Interest Area</Label>
                  <Input
                    id="interest_area"
                    placeholder="e.g., Technology, Business, Arts"
                    value={formData.interest_area}
                    onChange={(e) => setFormData({ ...formData, interest_area: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Career Goals</Label>
                <Textarea
                  id="goals"
                  placeholder="What are your career aspirations?"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hobbies">Hobbies & Interests</Label>
                <Textarea
                  id="hobbies"
                  placeholder="What do you enjoy doing in your free time?"
                  value={formData.hobbies}
                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily_habits">Daily Habits</Label>
                <Textarea
                  id="daily_habits"
                  placeholder="Describe your daily routine and habits"
                  value={formData.daily_habits}
                  onChange={(e) => setFormData({ ...formData, daily_habits: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_city">City</Label>
                  <Input
                    id="location_city"
                    value={formData.location_city}
                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_state">State</Label>
                  <Input
                    id="location_state"
                    value={formData.location_state}
                    onChange={(e) => setFormData({ ...formData, location_state: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
