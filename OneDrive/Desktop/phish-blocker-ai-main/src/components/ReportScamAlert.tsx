import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportScamAlertProps {
  type: "email" | "call";
  onReport: () => void;
}

export default function ReportScamAlert({ type, onReport }: ReportScamAlertProps) {
  const config = {
    email: {
      icon: Mail,
      title: "Report Email Scam",
      description: "Received a suspicious email? Report it now for AI-powered analysis and protection.",
      color: "text-blue-500",
    },
    call: {
      icon: Phone,
      title: "Report Call Scam",
      description: "Got a suspicious call? Report it to help protect yourself and others.",
      color: "text-orange-500",
    },
  };

  const { icon: Icon, title, description, color } = config[type];

  return (
    <Alert className="border-primary/20 bg-primary/5">
      <Icon className={`h-5 w-5 ${color}`} />
      <AlertTitle className="text-lg font-semibold">{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-muted-foreground">{description}</p>
        <Button onClick={onReport} className="gap-2">
          <Shield className="h-4 w-4" />
          Report {type === "email" ? "Email" : "Call"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
