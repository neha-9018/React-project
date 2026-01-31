import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schemas
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const analyzeScamSchema = z.object({
  messageType: z.enum(["email", "sms", "call"]),
  sender: z.string()
    .trim()
    .min(1, "Sender is required")
    .max(255, "Sender must be less than 255 characters")
    .refine((val) => {
      // For email type, validate email format
      // For sms/call, validate phone format
      return emailRegex.test(val) || phoneRegex.test(val);
    }, "Sender must be a valid email or phone number"),
  subject: z.string()
    .trim()
    .max(500, "Subject must be less than 500 characters")
    .optional(),
  content: z.string()
    .trim()
    .max(10000, "Content must be less than 10000 characters")
    .optional(),
  audioData: z.string().optional(),
}).refine(
  (data) => {
    if (data.messageType === "call") {
      return !!data.content || !!data.audioData;
    }
    return !!data.content;
  },
  {
    message: "Either content or audioData is required",
  }
);

// Sanitization function to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const incomingBody = await req.json();
    
    // Validate and sanitize inputs
    let validatedData;
    try {
      validatedData = analyzeScamSchema.parse(incomingBody);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return new Response(
          JSON.stringify({ 
            error: "Validation failed", 
            details: validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw validationError;
    }

    // Sanitize all text inputs
    const { messageType, sender, subject, content, audioData } = validatedData;
    const sanitizedSender = sanitizeInput(sender);
    const sanitizedSubject = subject ? sanitizeInput(subject) : undefined;
    const sanitizedContent = content ? sanitizeInput(content) : "";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create comprehensive analysis prompt with sanitized inputs
    let analysisPrompt: string;
    let hasAudio = false;
    
    if (audioData && messageType === "call") {
      hasAudio = true;
      analysisPrompt = `Analyze this phone call recording for scam, phishing, or suspicious content.

Sender: ${sanitizedSender}
${sanitizedSubject ? `Subject: ${sanitizedSubject}` : ''}

Listen to the audio recording and analyze for:
- Voice characteristics and authenticity (robotic/synthetic voice, accent inconsistencies)
- Urgency or pressure tactics
- Requests for personal or financial information
- Background noises suggesting call center or spoofed number
- Script-like speech patterns common in scams
- Too-good-to-be-true offers or threats
- Social engineering techniques

Provide a detailed analysis in JSON format with:
1. risk_level: "safe", "suspicious", "scam", or "phishing"
2. risk_score: number between 0 and 1 (0 = completely safe, 1 = definite scam)
3. flagged_reasons: array of specific reasons (e.g., "Robotic voice", "Pressure tactics", "Suspicious background noise")
4. analysis: detailed explanation based on what you hear
5. recommendations: what the user should do

Return ONLY valid JSON, no additional text.`;
    } else {
      analysisPrompt = `Analyze the following ${messageType} for scam, phishing, or suspicious content.

Sender: ${sanitizedSender}
${sanitizedSubject ? `Subject: ${sanitizedSubject}` : ''}
Content: ${sanitizedContent}

Provide a detailed analysis in JSON format with:
1. risk_level: "safe", "suspicious", "scam", or "phishing"
2. risk_score: number between 0 and 1 (0 = completely safe, 1 = definite scam)
3. flagged_reasons: array of specific reasons why this was flagged (e.g., "Suspicious domain", "Urgency tactics", "Too good to be true")
4. analysis: detailed explanation of why you classified it this way
5. recommendations: what the user should do

Focus on detecting:
- Phishing attempts (fake login pages, credential theft)
- Scam patterns (too good to be true offers, fake prizes)
- Suspicious urgency tactics
- Mismatched domains or spoofed sender addresses
- Requests for sensitive information
- Suspicious links or attachments
- Social engineering attempts

Return ONLY valid JSON, no additional text.`;
    }

    // Call Lovable AI for analysis
    const requestBody = {
      model: hasAudio ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash", // Use pro for audio
      messages: [
        { 
          role: "system", 
          content: "You are an expert cybersecurity analyst specializing in detecting scams, phishing, and fraudulent communications. Always respond with valid JSON only." 
        },
        { 
          role: "user", 
          content: hasAudio && audioData
            ? [
                { type: "text", text: analysisPrompt },
                { 
                  type: "audio",
                  audio: audioData,
                }
              ]
            : analysisPrompt
        }
      ],
    };

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error("No response from AI");
    }

    // Parse AI response
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(aiContent);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      // Fallback analysis
      analysisResult = {
        risk_level: "suspicious",
        risk_score: 0.5,
        flagged_reasons: ["Unable to complete full analysis"],
        analysis: "AI analysis could not be completed. Manual review recommended.",
        recommendations: "Review this message carefully before taking any action."
      };
    }

    // Get authorization token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required. Please log in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract JWT token from Bearer header
    const jwt = authHeader.replace("Bearer ", "").trim();
    
    if (!jwt || jwt.length < 20) {
      console.error("Invalid JWT token format");
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("JWT token received, length:", jwt.length);

    // Create Supabase client with JWT token for RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    // Set auth token explicitly for RLS policies to work
    await supabaseClient.auth.setSession({
      access_token: jwt,
      refresh_token: jwt, // Using same token as placeholder
    });

    // Verify user by passing JWT token explicitly
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    
    if (userError) {
      console.error("Error verifying user:", userError.message, userError);
      return new Response(
        JSON.stringify({ error: "Authentication failed", details: userError.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!user) {
      console.error("No user found in token");
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated successfully:", user.id);

    // Check if sender is in trusted contacts
    const { data: trustedContacts } = await supabaseClient
      .from("trusted_contacts")
      .select("contact_value")
      .eq("user_id", user.id);

    const isTrusted = trustedContacts?.some(tc => 
      tc.contact_value.toLowerCase() === sender.toLowerCase()
    );

    // Override risk level if sender is trusted
    if (isTrusted && analysisResult.risk_level !== "scam") {
      analysisResult.risk_level = "safe";
      analysisResult.risk_score = 0;
      analysisResult.flagged_reasons = ["Trusted contact"];
    }

    // Save to scam_logs with sanitized data
    const { error: insertError } = await supabaseClient
      .from("scam_logs")
      .insert({
        user_id: user.id,
        message_type: messageType,
        sender: sanitizedSender,
        subject: sanitizedSubject || null,
        content: sanitizedContent,
        risk_level: analysisResult.risk_level,
        risk_score: analysisResult.risk_score,
        flagged_reasons: analysisResult.flagged_reasons || [],
        ai_analysis: analysisResult,
      });

    if (insertError) {
      console.error("Error saving to scam_logs:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save analysis", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully saved to scam_logs");

    return new Response(
      JSON.stringify(analysisResult),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in analyze-scam function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});