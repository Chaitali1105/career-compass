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
import { Loader2, Edit, Save, X } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
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
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth/login");
        return;
      }
      
      setUserId(session.user.id);
      setUserEmail(session.user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profile) {
        setFormData({
          full_name: profile.full_name || "",
          marks_percentage: profile.marks_percentage?.toString() || "",
          main_skill: profile.main_skill || "",
          interest_area: profile.interest_area || "",
          goals: profile.goals || "",
          hobbies: profile.hobbies || "",
          daily_habits: profile.daily_habits || "",
          location_city: profile.location_city || "",
          location_state: profile.location_state || "",
        });
      }
      
      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          marks_percentage: formData.marks_percentage ? parseFloat(formData.marks_percentage) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-4xl mx-auto p-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">Your Profile</CardTitle>
                <CardDescription className="mt-2">
                  View and update your personal information
                </CardDescription>
              </div>
              {!editing && (
                <Button onClick={() => setEditing(true)} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <Label className="text-sm text-muted-foreground">Email Address</Label>
                <p className="text-foreground font-medium">{userEmail}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!editing || saving}
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
                    disabled={!editing || saving}
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
                    disabled={!editing || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest_area">Interest Area</Label>
                  <Input
                    id="interest_area"
                    placeholder="e.g., Technology, Business, Arts"
                    value={formData.interest_area}
                    onChange={(e) => setFormData({ ...formData, interest_area: e.target.value })}
                    disabled={!editing || saving}
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
                  disabled={!editing || saving}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hobbies">Hobbies & Interests</Label>
                <Textarea
                  id="hobbies"
                  placeholder="What do you enjoy doing in your free time?"
                  value={formData.hobbies}
                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  disabled={!editing || saving}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily_habits">Daily Habits</Label>
                <Textarea
                  id="daily_habits"
                  placeholder="Describe your daily routine and habits"
                  value={formData.daily_habits}
                  onChange={(e) => setFormData({ ...formData, daily_habits: e.target.value })}
                  disabled={!editing || saving}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_city">City</Label>
                  <Input
                    id="location_city"
                    value={formData.location_city}
                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                    disabled={!editing || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_state">State</Label>
                  <Input
                    id="location_state"
                    value={formData.location_state}
                    onChange={(e) => setFormData({ ...formData, location_state: e.target.value })}
                    disabled={!editing || saving}
                  />
                </div>
              </div>

              {editing && (
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
