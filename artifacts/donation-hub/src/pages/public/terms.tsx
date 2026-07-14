import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[calc(100vh-130px)]">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-widest uppercase text-center mb-8">
          TERMS OF <span className="text-primary">SERVICE</span>
        </h1>

        <Card className="glass-card border-white/10">
          <CardContent className="p-8 prose prose-invert max-w-none">
            <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
            
            <h3>1. Agreement to Terms</h3>
            <p>
              By accessing or using the IMUZAKI Donation Hub, you agree to be bound by these Terms. 
              If you disagree with any part of the terms, then you do not have permission to access the Service.
            </p>

            <h3>2. Donations and Refunds</h3>
            <p>
              All donations made through this platform are voluntary. By completing a transaction, you certify that:
            </p>
            <ul>
              <li>You are the authorized owner of the funds being transferred.</li>
              <li>The transaction is final and non-refundable.</li>
              <li>You are not receiving any tangible goods or services in exchange for this donation.</li>
            </ul>
            <p>
              Chargebacks or payment reversals without prior communication may result in a permanent ban from the community and broadcast channel.
            </p>

            <h3>3. On-Screen Alerts</h3>
            <p>
              Donations may trigger an automated on-screen alert during a live broadcast. We reserve the right to:
            </p>
            <ul>
              <li>Filter, censor, or skip messages that contain inappropriate, offensive, or promotional content.</li>
              <li>Disable alerts temporarily during certain broadcast segments.</li>
              <li>Modify the visual or audio components of the alert system at any time.</li>
            </ul>
            <p>
              A successful donation does not guarantee that your message will be read aloud or displayed on stream.
            </p>

            <h3>4. User Conduct</h3>
            <p>
              When submitting a donation message, you agree not to include content that is illegal, defamatory, 
              harassing, abusive, fraudulent, or otherwise objectionable.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
