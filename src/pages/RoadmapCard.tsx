import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Target, Lightbulb, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoadmapCardProps {
  roadmap: any;
}

export default function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const navigate = useNavigate();
  
  const steps = roadmap?.roadmap_steps || [];
  const skillGaps = roadmap?.skill_gaps || [];
  const alternativeCareers = roadmap?.alternative_careers || [];
  const resources = roadmap?.recommended_resources || [];

  return (
    <Card className="shadow-xl border-2 border-primary/20 max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <CardTitle className="text-2xl font-bold">{roadmap?.primary_career || "Your Career Path"}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Based on your {roadmap?.dominant_domain} interests
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Career Development Steps */}
        {steps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Career Development Steps:</h3>
            </div>
            <div className="space-y-2 pl-6 border-l-4 border-primary/30">
              {steps.slice(0, 5).map((step: any, index: number) => (
                <div key={index} className="text-sm leading-relaxed">
                  {step.title || step.description}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Skills to Develop */}
        {skillGaps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Key Skills to Develop:</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillGaps.slice(0, 5).map((skill: string, index: number) => (
                <Badge key={index} className="bg-primary text-primary-foreground px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Possible Career Paths */}
        {alternativeCareers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Possible Career Paths:</h3>
            </div>
            <div className="space-y-2 bg-accent/20 p-4 rounded-lg">
              {alternativeCareers.slice(0, 5).map((career: string, index: number) => (
                <div key={index} className="text-sm px-2 py-1 border-l-2 border-primary/40">
                  {career}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-muted-foreground">
            <strong>Notes:</strong> Focus on building practical experience. Start with small projects and gradually take on bigger challenges.
          </p>
        </div>

        {/* Resources */}
        {resources.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">{roadmap?.dominant_domain} Resources:</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {resources.slice(0, 3).map((resource: string, index: number) => (
                <Button key={index} variant="default" size="sm" className="text-xs">
                  {resource.split('-')[0].trim()}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/assessment/start")}>
            🚀 Get Motivation
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/assessment/start")}>
            📝 Take Assessment
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            📊 Track Progress
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
