import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MessageSquare, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageCardProps {
  id: string;
  type: "email" | "sms" | "call";
  from: string;
  subject?: string;
  preview: string;
  riskLevel: "safe" | "suspicious" | "scam" | "phishing";
  timestamp: string;
  flaggedReasons?: string[];
}

const riskConfig = {
  safe: { label: "Safe", color: "bg-success text-success-foreground", icon: "✓" },
  suspicious: { label: "Suspicious", color: "bg-warning text-warning-foreground", icon: "⚠" },
  scam: { label: "Scam", color: "bg-destructive text-destructive-foreground", icon: "✕" },
  phishing: { label: "Phishing", color: "bg-destructive text-destructive-foreground", icon: "⚠" },
};

const typeIcons = {
  email: Mail,
  sms: MessageSquare,
  call: Phone,
};

export default function MessageCard({ type, from, subject, preview, riskLevel, timestamp, flaggedReasons }: MessageCardProps) {
  const TypeIcon = typeIcons[type];
  const risk = riskConfig[riskLevel];

  return (
    <Card className={cn("transition-all hover:shadow-lg", riskLevel !== "safe" && "border-l-4 border-l-destructive")}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="rounded-lg bg-secondary p-3">
              <TypeIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{from}</p>
                <Badge className={risk.color}>
                  {risk.icon} {risk.label}
                </Badge>
              </div>
              {subject && <p className="text-sm font-medium text-muted-foreground">{subject}</p>}
              <p className="text-sm text-muted-foreground line-clamp-2">{preview}</p>
              {flaggedReasons && flaggedReasons.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <p className="text-xs text-warning">{flaggedReasons.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground whitespace-nowrap">{timestamp}</p>
        </div>
      </CardContent>
    </Card>
  );
}
