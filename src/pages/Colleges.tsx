import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Loader2, MapPin, Navigation as NavigationIcon } from "lucide-react";
import { toast } from "sonner";

export default function Colleges() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState<any[]>([]);
  const [userDomain, setUserDomain] = useState("");
  const [userLocation, setUserLocation] = useState({ city: "", state: "" });
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<"pending" | "granted" | "denied">("pending");

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      toast.info("Requesting location access...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationPermission("granted");
          toast.success("Location access granted! Showing nearby colleges.");
        },
        (error) => {
          console.error("Location error:", error);
          setLocationPermission("denied");
          toast.error("Location access denied. Showing colleges based on your profile.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setLocationPermission("denied");
    }
  };

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

      // Fetch all colleges
      const { data } = await supabase
        .from("colleges")
        .select("*");

      if (data) {
        // Filter and sort colleges: prioritize career domain match, then proximity
        const sortedColleges = data
          .filter(college => college.domain === domain) // Only show colleges matching career domain
          .sort((a, b) => {
            const aScore = calculateProximityScore(a, { city, state, domain });
            const bScore = calculateProximityScore(b, { city, state, domain });
            return bScore - aScore;
          });
        
        setColleges(sortedColleges);
      }
      
      setLoading(false);
    };

    const calculateProximityScore = (
      college: any,
      user: { city: string; state: string; domain: string }
    ) => {
      let score = 0;
      if (college.domain === user.domain) score += 10;
      if (college.state.toLowerCase() === user.state.toLowerCase()) score += 5;
      if (college.city.toLowerCase() === user.city.toLowerCase()) score += 3;
      return score;
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

  const getProximityLabel = (college: any) => {
    const cityMatch = college.city.toLowerCase() === userLocation.city.toLowerCase();
    const stateMatch = college.state.toLowerCase() === userLocation.state.toLowerCase();
    
    if (cityMatch && stateMatch) return { label: "In Your City", variant: "default" as const };
    if (stateMatch) return { label: "In Your State", variant: "secondary" as const };
    return { label: "Other Region", variant: "outline" as const };
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Recommended Colleges</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Colleges matching your career domain: <Badge className="ml-2">{userDomain}</Badge>
        </p>

        {locationPermission === "pending" && (
          <Card className="mb-6 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <NavigationIcon className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Find colleges near you</h3>
                    <p className="text-sm text-muted-foreground">
                      Allow location access to see colleges sorted by distance
                    </p>
                  </div>
                </div>
                <Button onClick={requestLocation}>
                  Allow Location
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {locationPermission === "granted" && currentLocation && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <NavigationIcon className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium">
                  Showing colleges near your location
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.length === 0 ? (
            <Card className="col-span-full shadow-md">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No Colleges Found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find colleges matching your career domain ({userDomain}) in our database.
                </p>
                <p className="text-sm text-muted-foreground">
                  Try searching online for colleges specializing in {userDomain}.
                </p>
              </CardContent>
            </Card>
          ) : (
            colleges.map((college) => {
              const proximity = getProximityLabel(college);
              return (
                <Card key={college.id} className="shadow-md hover:shadow-lg transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-lg">{college.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {college.city}, {college.state}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{college.domain}</Badge>
                      <Badge variant={proximity.variant}>{proximity.label}</Badge>
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
