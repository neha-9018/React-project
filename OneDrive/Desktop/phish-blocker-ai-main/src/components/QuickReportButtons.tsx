import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickReportButtonsProps {
  onReportEmail: () => void;
  onReportCall: () => void;
  onReportSMS: () => void;
}

export default function QuickReportButtons({
  onReportEmail,
  onReportCall,
  onReportSMS,
}: QuickReportButtonsProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Quick Report
        </CardTitle>
        <CardDescription>
          Report suspicious communications instantly
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          onClick={onReportEmail}
        >
          <Mail className="h-6 w-6 text-blue-500" />
          <span className="text-sm font-medium">Report Email</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          onClick={onReportCall}
        >
          <Phone className="h-6 w-6 text-orange-500" />
          <span className="text-sm font-medium">Report Call</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          onClick={onReportSMS}
        >
          <MessageSquare className="h-6 w-6 text-green-500" />
          <span className="text-sm font-medium">Report SMS</span>
        </Button>
      </CardContent>
    </Card>
  );
}
