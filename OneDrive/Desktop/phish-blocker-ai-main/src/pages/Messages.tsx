import { useState, useEffect } from "react";
import MessageCard from "@/components/MessageCard";
import AnalyzeMessageDialog from "@/components/AnalyzeMessageDialog";
import MessageDetailsDialog from "@/components/MessageDetailsDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useScamLogs, useScamStats, ScamLog } from "@/hooks/useScamLogs";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import StatCard from "@/components/StatCard";
import { Shield, AlertTriangle, Activity, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ScamLog | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { data: logs, isLoading, refetch: refetchLogs } = useScamLogs();
  const { data: stats, refetch: refetchStats } = useScamStats();

  // Setup realtime subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('scam-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scam_logs'
        },
        () => {
          // Refetch data when new record is inserted
          refetchLogs();
          refetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchLogs, refetchStats]);

  const handleAnalysisComplete = () => {
    // Refetch both logs and stats to update all counters
    refetchLogs();
    refetchStats();
  };

  const handleMessageClick = (log: ScamLog) => {
    setSelectedMessage(log);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredMessages = logs?.filter((log) => {
    const matchesSearch = log.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === "all" || log.risk_level === filterRisk;
    const matchesType = filterType === "all" || log.message_type === filterType;
    return matchesSearch && matchesRisk && matchesType;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages & Communications</h1>
          <p className="text-muted-foreground">AI-powered analysis of all your messages - updates in real-time</p>
        </div>
        <AnalyzeMessageDialog onAnalysisComplete={handleAnalysisComplete} />
      </div>

      {/* Analytics Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Threats Blocked"
          value={stats?.totalThreats || 0}
          icon={Shield}
          variant="danger"
        />
        <StatCard
          title="Active Alerts"
          value={stats?.activeAlerts || 0}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Messages Analyzed"
          value={stats?.totalAnalyzed || 0}
          icon={Activity}
        />
        <StatCard
          title="Protection Score"
          value={`${stats?.protectionScore || 100}%`}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="suspicious">Suspicious</SelectItem>
              <SelectItem value="scam">Scam</SelectItem>
              <SelectItem value="phishing">Phishing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Message Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="call">Call</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((log) => (
            <div
              key={log.id}
              onClick={() => handleMessageClick(log)}
              className="cursor-pointer transition-all hover:scale-[1.02]"
            >
              <MessageCard
                id={log.id}
                type={log.message_type}
                from={log.sender}
                subject={log.subject}
                preview={log.content.substring(0, 150) + "..."}
                riskLevel={log.risk_level}
                timestamp={format(new Date(log.created_at), "PPp")}
                flaggedReasons={log.flagged_reasons}
              />
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {logs?.length === 0 ? "No messages analyzed yet" : "No messages found matching your filters"}
            </p>
          </div>
        )}
      </div>

      {/* Message Details Dialog */}
      <MessageDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        message={selectedMessage}
      />
    </div>
  );
}
