import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ThreatChart from "@/components/ThreatChart";
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useScamLogs, useScamStats } from "@/hooks/useScamLogs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import EmailReportDialog from "@/components/EmailReportDialog";

const currentWeekData = [
  { name: "Mon", count: 4 },
  { name: "Tue", count: 7 },
  { name: "Wed", count: 3 },
  { name: "Thu", count: 9 },
  { name: "Fri", count: 5 },
  { name: "Sat", count: 2 },
  { name: "Sun", count: 1 },
];

const previousWeekData = [
  { name: "Mon", count: 6 },
  { name: "Tue", count: 4 },
  { name: "Wed", count: 5 },
  { name: "Thu", count: 3 },
  { name: "Fri", count: 8 },
  { name: "Sat", count: 4 },
  { name: "Sun", count: 3 },
];

export default function Reports() {
  const [dateRange, setDateRange] = useState("7days");
  const [threatType, setThreatType] = useState("all");
  const { data: logs } = useScamLogs();
  const { data: stats } = useScamStats();
  const { toast } = useToast();

  const currentTotal = currentWeekData.reduce((sum, item) => sum + item.count, 0);
  const previousTotal = previousWeekData.reduce((sum, item) => sum + item.count, 0);
  const percentageChange = ((currentTotal - previousTotal) / previousTotal * 100).toFixed(1);
  const isIncrease = currentTotal > previousTotal;

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text("Scam Protection Report", 14, 20);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 28);
    
    // Summary Stats
    doc.setFontSize(14);
    doc.text("Summary Statistics", 14, 40);
    doc.setFontSize(10);
    doc.text(`Total Threats Blocked: ${stats?.totalThreats || 0}`, 14, 48);
    doc.text(`Active Alerts: ${stats?.activeAlerts || 0}`, 14, 54);
    doc.text(`Messages Analyzed: ${stats?.totalAnalyzed || 0}`, 14, 60);
    doc.text(`Protection Score: ${stats?.protectionScore || 100}%`, 14, 66);
    
    // Threat Analysis Table
    if (logs && logs.length > 0) {
      const tableData = logs
        .filter(log => threatType === "all" || log.risk_level === threatType)
        .slice(0, 20)
        .map(log => [
          format(new Date(log.created_at), "MMM dd, yyyy"),
          log.message_type.toUpperCase(),
          log.sender,
          log.risk_level.toUpperCase(),
          (log.flagged_reasons || []).join(", ").substring(0, 50),
        ]);

      autoTable(doc, {
        startY: 75,
        head: [["Date", "Type", "Sender", "Risk Level", "Reasons"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [220, 53, 69] },
        styles: { fontSize: 8 },
      });
    }
    
    // Footer
    const pdfInternal = doc.internal as { getNumberOfPages: () => number; pageSize: { width: number; height: number } };
    const pageCount = pdfInternal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pdfInternal.pageSize.width / 2,
        pdfInternal.pageSize.height - 10,
        { align: "center" }
      );
    }
    
    doc.save(`scam-protection-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    
    toast({
      title: "PDF Exported",
      description: "Your report has been downloaded successfully",
    });
  };

  const exportCSV = () => {
    if (!logs || logs.length === 0) {
      toast({
        title: "No Data",
        description: "No messages to export",
        variant: "destructive",
      });
      return;
    }

    const filteredLogs = logs.filter(log => threatType === "all" || log.risk_level === threatType);
    
    const csvContent = [
      ["Date", "Type", "Sender", "Subject", "Risk Level", "Risk Score", "Flagged Reasons"],
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
        log.message_type,
        log.sender,
        log.subject || "",
        log.risk_level,
        log.risk_score || "",
        (log.flagged_reasons || []).join("; "),
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scam-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: "Your data has been downloaded successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Threat Reports & Analytics</h1>
        <p className="text-muted-foreground">Detailed analysis and period comparisons</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Select value={threatType} onValueChange={setThreatType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Threat Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Threats</SelectItem>
              <SelectItem value="phishing">Phishing</SelectItem>
              <SelectItem value="scam">Scam</SelectItem>
              <SelectItem value="suspicious">Suspicious</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period Comparison */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Period Comparison</span>
            <Badge variant={isIncrease ? "destructive" : "default"} className="text-sm">
              {isIncrease ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
              {isIncrease ? "+" : ""}{percentageChange}% vs previous period
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Current Period</h3>
              <ThreatChart type="line" title={`Threats: ${currentTotal} total`} data={currentWeekData} />
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Previous Period</h3>
              <ThreatChart type="line" title={`Threats: ${previousTotal} total`} data={previousWeekData} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Weekly Summary Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 rounded-lg border border-border bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Phishing Attempts</p>
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-xs text-destructive">+3 from last week</p>
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Scam Calls</p>
              <p className="text-2xl font-bold text-foreground">8</p>
              <p className="text-xs text-success">-2 from last week</p>
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Suspicious SMS</p>
              <p className="text-2xl font-bold text-foreground">6</p>
              <p className="text-xs text-warning">Same as last week</p>
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Safe Messages</p>
              <p className="text-2xl font-bold text-foreground">1,221</p>
              <p className="text-xs text-success">+89 from last week</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Weekly Report Email</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Get a comprehensive weekly summary delivered to your inbox every Monday
            </p>
            <EmailReportDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
