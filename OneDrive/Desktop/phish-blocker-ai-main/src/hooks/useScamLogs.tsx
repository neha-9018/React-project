import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScamLog {
  id: string;
  user_id: string;
  message_type: "email" | "sms" | "call";
  sender: string;
  subject?: string;
  content: string;
  risk_level: "safe" | "suspicious" | "scam" | "phishing";
  risk_score?: number;
  flagged_reasons?: string[];
  ai_analysis?: unknown;
  created_at: string;
}

export function useScamLogs() {
  return useQuery({
    queryKey: ["scam-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scam_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ScamLog[];
    },
  });
}

export function useScamStats() {
  return useQuery({
    queryKey: ["scam-stats"],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from("scam_logs")
        .select("risk_level, created_at");

      if (error) throw error;

      const totalThreats = logs?.filter((log) => log.risk_level !== "safe").length || 0;
      const activeAlerts = logs?.filter(
        (log) =>
          log.risk_level !== "safe" &&
          new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length || 0;
      const totalAnalyzed = logs?.length || 0;

      const safeCount = logs?.filter((log) => log.risk_level === "safe").length || 0;
      const protectionScore = totalAnalyzed > 0 ? Math.round((safeCount / totalAnalyzed) * 100) : 100;

      return {
        totalThreats,
        activeAlerts,
        totalAnalyzed,
        protectionScore,
      };
    },
  });
}
