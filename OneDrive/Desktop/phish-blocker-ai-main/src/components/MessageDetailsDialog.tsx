import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Shield, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface MessageDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: {
    id: string;
    message_type: string;
    sender: string;
    subject?: string;
    content: string;
    risk_level: string;
    risk_score?: number;
    flagged_reasons?: string[];
    ai_analysis?: {
      analysis?: string;
      recommendations?: string[];
      [key: string]: unknown;
    };
    created_at: string;
  };
}

export default function MessageDetailsDialog({ open, onOpenChange, message }: MessageDetailsDialogProps) {
  if (!message) return null;

  const riskColors = {
    safe: "text-success border-success bg-success/10",
    suspicious: "text-warning border-warning bg-warning/10",
    scam: "text-destructive border-destructive bg-destructive/10",
    phishing: "text-destructive border-destructive bg-destructive/10",
  };

  const riskIcons = {
    safe: CheckCircle,
    suspicious: AlertTriangle,
    scam: Shield,
    phishing: TrendingUp,
  };

  const Icon = riskIcons[message.risk_level as keyof typeof riskIcons] || Shield;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Message Analysis Details
          </DialogTitle>
          <DialogDescription>
            Analyzed on {format(new Date(message.created_at), "PPP 'at' p")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Risk Level Card */}
          <Card className={`border-2 ${riskColors[message.risk_level as keyof typeof riskColors]}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Risk Assessment</span>
                <Badge variant={message.risk_level === "safe" ? "default" : "destructive"} className="text-lg px-4 py-1">
                  {message.risk_level.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Score:</span>
                  <span className="font-semibold">{message.risk_score ? `${(message.risk_score * 100).toFixed(1)}%` : "N/A"}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      message.risk_level === "safe" ? "bg-success" :
                      message.risk_level === "suspicious" ? "bg-warning" :
                      "bg-destructive"
                    }`}
                    style={{ width: `${(message.risk_score || 0) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Details */}
          <Card>
            <CardHeader>
              <CardTitle>Message Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{message.message_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sender</p>
                  <p className="font-medium">{message.sender}</p>
                </div>
              </div>
              {message.subject && (
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{message.subject}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Content</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flagged Reasons */}
          {message.flagged_reasons && message.flagged_reasons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Flagged Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {message.flagged_reasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                      <span className="text-sm">{reason}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          {message.ai_analysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{message.ai_analysis.analysis}</p>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {message.ai_analysis.recommendations && message.ai_analysis.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {message.ai_analysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
