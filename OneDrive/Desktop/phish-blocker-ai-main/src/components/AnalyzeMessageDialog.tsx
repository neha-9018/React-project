import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import AudioRecorder from "./AudioRecorder";

// Validation schemas
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const analyzeMessageSchema = z.object({
  messageType: z.enum(["email", "sms", "call"]),
  sender: z.string()
    .trim()
    .min(1, "Sender is required")
    .max(255, "Sender must be less than 255 characters")
    .refine((val) => emailRegex.test(val) || phoneRegex.test(val), 
      "Please enter a valid email address or phone number (e.g., +1234567890)"),
  subject: z.string()
    .trim()
    .max(500, "Subject must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  content: z.string()
    .trim()
    .max(10000, "Content must be less than 10000 characters")
    .optional()
    .or(z.literal("")),
  audioData: z.string().optional().or(z.literal("")),
}).refine(
  (data) => {
    // For calls, require either content OR audioData
    if (data.messageType === "call") {
      return (data.content && data.content.length > 0) || (data.audioData && data.audioData.length > 0);
    }
    // For email/sms, require content
    return data.content && data.content.length > 0;
  },
  {
    message: "Either message content or audio recording is required",
    path: ["content"],
  }
);

type AnalyzeMessageForm = z.infer<typeof analyzeMessageSchema>;

interface AnalyzeMessageDialogProps {
  onAnalysisComplete?: () => void;
  defaultType?: "email" | "sms" | "call";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AnalyzeMessageDialog({ 
  onAnalysisComplete, 
  defaultType = "email",
  open: controlledOpen,
  onOpenChange
}: AnalyzeMessageDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<AnalyzeMessageForm>({
    resolver: zodResolver(analyzeMessageSchema),
    defaultValues: {
      messageType: defaultType,
      sender: "",
      subject: "",
      content: "",
      audioData: "",
    },
  });

  const messageType = form.watch("messageType");

  // Update message type when defaultType changes
  useEffect(() => {
    form.setValue("messageType", defaultType);
  }, [defaultType, form]);

  const onSubmit = async (values: AnalyzeMessageForm) => {
    setLoading(true);

    try {
      // Get current session to ensure user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to analyze messages",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("analyze-scam", {
        body: {
          messageType: values.messageType,
          sender: values.sender,
          subject: values.messageType === "email" ? values.subject : undefined,
          content: values.content,
          audioData: values.audioData,
        },
      });

      if (error) {
        console.error("Function invocation error:", error);
        throw error;
      }

      // Show alert based on risk level
      const riskMessages = {
        safe: {
          title: "✅ Safe Message",
          description: "No threats detected. This message appears safe.",
          variant: "default" as const,
        },
        suspicious: {
          title: "⚠️ Suspicious Activity Detected",
          description: "This message shows suspicious patterns. Please review carefully.",
          variant: "destructive" as const,
        },
        scam: {
          title: "🚨 SCAM ALERT",
          description: "High risk scam detected! Do not respond or share information.",
          variant: "destructive" as const,
        },
        phishing: {
          title: "🎣 PHISHING ATTEMPT BLOCKED",
          description: "Dangerous phishing attempt detected! Do not click any links.",
          variant: "destructive" as const,
        },
      };

      const alert = riskMessages[data.risk_level as keyof typeof riskMessages];
      
      toast({
        title: alert.title,
        description: alert.description,
        variant: alert.variant,
        duration: data.risk_level === "safe" ? 3000 : 10000,
      });

      // Reset form
      form.reset();
      setOpen(false);
      
      onAnalysisComplete?.();
    } catch (error: unknown) {
      console.error("Analysis error:", error);
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Analysis Failed",
        description: message || "Failed to analyze message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          <Button size="lg" className="gap-2">
            <Shield className="h-5 w-5" />
            Analyze New Message
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Report & Analyze {messageType === "email" ? "Email" : messageType === "call" ? "Call" : "SMS"} Scam</DialogTitle>
          <DialogDescription>
            Enter the details to get AI-powered scam detection and real-time alerts
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 pr-2">
          <Alert className="border-orange-500/50 bg-orange-500/10 mb-4">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle>Security Alert</AlertTitle>
            <AlertDescription>
              High-risk threats will trigger immediate alerts. Never share personal or financial information.
            </AlertDescription>
          </Alert>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="messageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Sender {messageType === "email" ? "(Email)" : "(Phone)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={messageType === "email" ? "sender@example.com" : "+1234567890"}
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {messageType === "email" && (
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Message subject"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {messageType === "call" ? (
              <FormField
                control={form.control}
                name="audioData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call Recording</FormLabel>
                    <FormControl>
                      <AudioRecorder
                        onAudioRecorded={(_, base64) => {
                          field.onChange(base64);
                          form.setValue("content", ""); // Clear text content when audio is recorded
                        }}
                        onClear={() => {
                          field.onChange("");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the full message content..."
                        className="min-h-[150px]"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)} 
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Analyze Message
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
