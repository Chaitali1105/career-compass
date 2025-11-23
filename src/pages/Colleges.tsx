import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Loader2, MapPin } from "lucide-react";

export default function Colleges() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState<any[]>([]);
  const [userDomain, setUserDomain] = useState("");
  const [userLocation, setUserLocation] = useState({ city: "", state: "" });

  useEffect(() => {
    const loadColleges = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("location_city, location_state")
        .eq("user_id", session.user.id)
        .single();

      const { data: recommendation } = await supabase
        .from("career_recommendations")
        .select("dominant_domain")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const domain = recommendation?.dominant_domain || "Technology";
      const city = profile?.location_city || "";
      const state = profile?.location_state || "";

      setUserDomain(domain);
      setUserLocation({ city, state });

      // Fetch colleges matching domain and location
      // First try exact domain match, then show all if no matches
      let query = supabase.from("colleges").select("*");
      
      if (domain) {
        query = query.eq("domain", domain);
      }

      let { data } = await query;
      
      // If no exact matches, try to get colleges from same state
      if (!data || data.length === 0) {
        const fallbackQuery = supabase.from("colleges").select("*");
        if (state) {
          fallbackQuery.eq("state", state);
        }
        const fallbackResult = await fallbackQuery.limit(10);
        data = fallbackResult.data;
      }
      
      // If still no matches, just show top colleges by domain
      if (!data || data.length === 0) {
        const allQuery = supabase.from("colleges").select("*").limit(10);
        const allResult = await allQuery;
        data = allResult.data;
      }
      
      setColleges(data || []);
      setLoading(false);
    };

    loadColleges();
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Recommended Colleges</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Colleges in your area matching your career domain: <Badge className="ml-2">{userDomain}</Badge>
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.map((college) => (
            <Card key={college.id} className="shadow-md hover:shadow-lg transition-smooth">
              <CardHeader>
                <CardTitle className="text-lg">{college.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  {college.city}, {college.state}
                </div>
                <div>
                  <Badge variant="secondary">{college.domain}</Badge>
                </div>
                <p className="text-sm font-medium">{college.course}</p>
                {college.website && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={college.website} target="_blank" rel="noopener noreferrer">
                      Visit Website <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
