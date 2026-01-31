import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Mail, Phone, Link as LinkIcon, CreditCard, Lock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const tipCategories = [
  {
    icon: Mail,
    title: "Email Security",
    tips: [
      {
        title: "Check sender addresses carefully",
        content: "Scammers often use domains that look similar to legitimate ones (e.g., 'paypa1.com' instead of 'paypal.com'). Always verify the sender's email address before clicking any links.",
      },
      {
        title: "Be wary of urgent requests",
        content: "Phishing emails often create a false sense of urgency to pressure you into acting quickly without thinking. Legitimate companies rarely ask for immediate action via email.",
      },
      {
        title: "Never share sensitive information via email",
        content: "No legitimate company will ask you to provide passwords, credit card numbers, or social security numbers via email.",
      },
    ],
  },
  {
    icon: Phone,
    title: "Call & SMS Safety",
    tips: [
      {
        title: "Don't trust caller ID alone",
        content: "Scammers can spoof phone numbers to make it appear they're calling from legitimate organizations. Always verify independently.",
      },
      {
        title: "Never share verification codes",
        content: "If someone asks for a verification code sent to your phone, it's likely a scam. These codes are meant for your eyes only.",
      },
      {
        title: "Be cautious of unknown numbers",
        content: "If you receive a call from an unknown number claiming to be from a company, hang up and call them back using the official number from their website.",
      },
    ],
  },
  {
    icon: LinkIcon,
    title: "Link Safety",
    tips: [
      {
        title: "Hover before you click",
        content: "Before clicking any link, hover your mouse over it to see the actual URL. If it looks suspicious or doesn't match the expected domain, don't click.",
      },
      {
        title: "Look for HTTPS",
        content: "Legitimate websites use HTTPS (look for the padlock icon in your browser). However, scammers can also use HTTPS, so this alone isn't enough to verify safety.",
      },
      {
        title: "Use direct navigation",
        content: "Instead of clicking links in emails, type the company's web address directly into your browser or use a bookmark.",
      },
    ],
  },
  {
    icon: CreditCard,
    title: "Financial Security",
    tips: [
      {
        title: "Monitor your accounts regularly",
        content: "Check your bank and credit card statements frequently for unauthorized transactions. Report suspicious activity immediately.",
      },
      {
        title: "Use strong, unique passwords",
        content: "Create complex passwords and use a different one for each account. Consider using a password manager to keep track of them.",
      },
      {
        title: "Enable two-factor authentication",
        content: "Whenever possible, enable 2FA on your accounts. This adds an extra layer of security even if your password is compromised.",
      },
    ],
  },
];

const commonScams = [
  {
    title: "IRS/Tax Scam",
    description: "Scammers impersonate IRS agents claiming you owe taxes and demanding immediate payment.",
    warning: "The IRS never initiates contact via phone, email, or social media about tax bills.",
  },
  {
    title: "Tech Support Scam",
    description: "Fake tech support claiming your computer is infected and asking for remote access.",
    warning: "Legitimate tech companies don't make unsolicited calls about computer problems.",
  },
  {
    title: "Prize/Lottery Scam",
    description: "Claims you've won a prize or lottery but need to pay fees or taxes upfront.",
    warning: "You never have to pay to receive legitimate winnings.",
  },
  {
    title: "Romance Scam",
    description: "Scammers build online relationships and eventually ask for money.",
    warning: "Be extremely cautious about sending money to people you've never met in person.",
  },
];

export default function SecurityTips() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security Tips & Education</h1>
        <p className="text-muted-foreground">Learn how to protect yourself from scams and phishing</p>
      </div>

      {/* Protection Tips by Category */}
      <div className="grid gap-6 lg:grid-cols-2">
        {tipCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {category.tips.map((tip, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-left">{tip.title}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{tip.content}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Common Scams */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            Common Scams to Watch Out For
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {commonScams.map((scam, idx) => (
            <div key={idx} className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <h3 className="mb-2 font-semibold text-foreground">{scam.title}</h3>
              <p className="mb-2 text-sm text-muted-foreground">{scam.description}</p>
              <div className="flex items-start gap-2 rounded bg-background/50 p-2">
                <Lock className="mt-0.5 h-4 w-4 text-warning" />
                <p className="text-xs text-warning">{scam.warning}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
