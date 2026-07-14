import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[calc(100vh-130px)]">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-widest uppercase text-center mb-8">
          PRIVACY <span className="text-primary">POLICY</span>
        </h1>

        <Card className="glass-card border-white/10">
          <CardContent className="p-8 prose prose-invert max-w-none">
            <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
            
            <h3>1. Information We Collect</h3>
            <p>When you use the IMUZAKI Donation Hub, we may collect the following information:</p>
            <ul>
              <li><strong>Information you provide:</strong> Name/Alias, donation message, and the donation amount.</li>
              <li><strong>Payment Information:</strong> Processed securely via ABA PayWay. We do not store full credit card numbers or bank credentials on our servers.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and timestamp of the transaction for fraud prevention and security logs.</li>
            </ul>

            <h3>2. How We Use Your Information</h3>
            <p>We use the collected data for the following purposes:</p>
            <ul>
              <li>To process and verify your donation transactions.</li>
              <li>To display your chosen alias and message on the live broadcast overlay (unless marked as anonymous).</li>
              <li>To maintain a ledger of top supporters for community recognition.</li>
              <li>To detect and prevent fraudulent transactions or abuse of the platform.</li>
            </ul>

            <h3>3. Data Visibility</h3>
            <p>
              By default, your provided alias, donation amount, and message may be publicly visible on the live broadcast 
              and the public donation leaderboards. If you select "Ghost Protocol (Anonymous)" during checkout, your identity 
              will be hidden from the public view, though the transaction amount remains part of aggregate statistics.
            </p>

            <h3>4. Data Sharing</h3>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We only share necessary 
              transactional data with our payment processor (ABA PayWay) to complete your donation securely.
            </p>

            <h3>5. Security</h3>
            <p>
              We implement appropriate security measures to protect against unauthorized access, alteration, 
              disclosure, or destruction of your personal information stored on our platform.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
