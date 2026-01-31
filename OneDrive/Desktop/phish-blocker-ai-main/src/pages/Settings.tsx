import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Bell, Users, Lock, Mail } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your protection preferences</p>
      </div>

      {/* Alert Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            Alert Settings
          </CardTitle>
          <CardDescription>Configure when and how you receive threat notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Real-time Alerts</Label>
              <p className="text-sm text-muted-foreground">Get instant notifications for high-risk threats</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive daily summary via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Get comprehensive weekly threat reports</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Alert Threshold</Label>
            <p className="text-sm text-muted-foreground">Set minimum risk level for notifications</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">All</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Suspicious+</Badge>
              <Badge variant="default" className="cursor-pointer">High Risk Only</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trusted Contacts */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            Trusted Contacts
          </CardTitle>
          <CardDescription>Add contacts that should never be flagged</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trusted-email">Add Trusted Email/Phone</Label>
            <div className="flex gap-2">
              <Input id="trusted-email" placeholder="email@example.com or +1234567890" />
              <Button>Add</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Current Trusted Contacts</Label>
            <div className="space-y-2">
              {["john.doe@example.com", "jane.smith@company.com", "+1 (555) 123-4567"].map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-secondary p-3">
                  <span className="text-sm text-foreground">{contact}</span>
                  <Button variant="ghost" size="sm">Remove</Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            Privacy & Data
          </CardTitle>
          <CardDescription>Control how your data is processed and stored</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Local Processing Only</Label>
              <p className="text-sm text-muted-foreground">Process all data on-device (may be slower)</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Anonymous Analytics</Label>
              <p className="text-sm text-muted-foreground">Help improve detection by sharing anonymized threat data</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Retention</Label>
              <p className="text-sm text-muted-foreground">Automatically delete old threat logs after 90 days</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Protection Level */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            Protection Level
          </CardTitle>
          <CardDescription>Adjust how aggressive the AI detection should be</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="cursor-pointer rounded-lg border-2 border-primary bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Maximum Protection</h4>
                  <p className="text-sm text-muted-foreground">Most aggressive filtering (recommended)</p>
                </div>
                <Badge>Active</Badge>
              </div>
            </div>
            <div className="cursor-pointer rounded-lg border border-border p-4 hover:bg-secondary">
              <h4 className="font-semibold text-foreground">Balanced</h4>
              <p className="text-sm text-muted-foreground">Standard protection with fewer false positives</p>
            </div>
            <div className="cursor-pointer rounded-lg border border-border p-4 hover:bg-secondary">
              <h4 className="font-semibold text-foreground">Minimal</h4>
              <p className="text-sm text-muted-foreground">Only flag obvious scams</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full">Save All Settings</Button>
    </div>
  );
}
