import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import ThreatChart from "@/components/ThreatChart";
import MessageCard from "@/components/MessageCard";
import AnalyzeMessageDialog from "@/components/AnalyzeMessageDialog";
import QuickReportButtons from "@/components/QuickReportButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScamLogs, useScamStats } from "@/hooks/useScamLogs";
import { Loader2 } from "lucide-react";
import { format, startOfWeek, subDays } from "date-fns";
import { useState } from "react";

export default function Dashboard() {
  const { data: logs, isLoading, refetch: refetchLogs } = useScamLogs();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useScamStats();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"email" | "sms" | "call">("email");

  const handleAnalysisComplete = () => {
    // Refetch both logs and stats to update all counters in real-time
    refetchLogs();
    refetchStats();
  };

  if (isLoading || statsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate weekly data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayLogs = logs?.filter((log) => {
      const logDate = new Date(log.created_at);
      return format(logDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") && log.risk_level !== "safe";
    });
    return {
      name: format(date, "EEE"),
      count: dayLogs?.length || 0,
    };
  });

  // Calculate category data
  const categoryData = [
    { name: "Phishing", count: logs?.filter((l) => l.risk_level === "phishing").length || 0 },
    { name: "Scam", count: logs?.filter((l) => l.risk_level === "scam").length || 0 },
    { name: "Suspicious", count: logs?.filter((l) => l.risk_level === "suspicious").length || 0 },
  ].filter((cat) => cat.count > 0);

  const recentThreats = logs?.filter((log) => log.risk_level !== "safe").slice(0, 3) || [];

  const handleQuickReport = (type: "email" | "sms" | "call") => {
    setSelectedType(type);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Real-time protection and threat monitoring</p>
        </div>
      </div>

      {/* Quick Report Buttons */}
      <QuickReportButtons
        onReportEmail={() => handleQuickReport("email")}
        onReportCall={() => handleQuickReport("call")}
        onReportSMS={() => handleQuickReport("sms")}
      />

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Threats Blocked"
          value={stats?.totalThreats || 0}
          icon={Shield}
          variant="default"
        />
        <StatCard
          title="Active Alerts"
          value={stats?.activeAlerts || 0}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          title="Messages Analyzed"
          value={stats?.totalAnalyzed || 0}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Protection Score"
          value={`${stats?.protectionScore || 100}%`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Charts */}
      {categoryData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ThreatChart type="line" title="Threats Detected This Week" data={weeklyData} />
          <ThreatChart type="bar" title="Threats by Category" data={categoryData} />
        </div>
      )}

      {/* Recent Threats */}
      {recentThreats.length > 0 && (
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Threats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentThreats.map((log) => (
              <MessageCard
                key={log.id}
                id={log.id}
                type={log.message_type}
                from={log.sender}
                subject={log.subject}
                preview={log.content.substring(0, 100) + "..."}
                riskLevel={log.risk_level}
                timestamp={format(new Date(log.created_at), "PPp")}
                flaggedReasons={log.flagged_reasons}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {logs?.length === 0 && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Messages Analyzed Yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Start protecting yourself by using the quick report buttons above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Controlled dialog */}
      <AnalyzeMessageDialog
        defaultType={selectedType}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAnalysisComplete={() => {
          setDialogOpen(false);
          handleAnalysisComplete();
        }}
      />
    </div>
  );
}
