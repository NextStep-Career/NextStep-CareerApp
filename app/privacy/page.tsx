import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-[family-name:var(--font-space-grotesk)]">NextStep</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Privacy Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-space-grotesk)] mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <div>
              <p className="text-lg text-muted-foreground">Effective Date: January 1, 2024</p>
              <p className="text-lg text-muted-foreground">Last Updated: January 1, 2024</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                NextStep ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our platform and services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">2. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Account Information (e.g., name, email)</li>
                <li>Profile Information (e.g., interests, career preferences)</li>
                <li>Usage Data (e.g., pages visited, actions taken)</li>
                <li>Device and Log Information</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To provide and personalize our services</li>
                <li>To communicate with you about updates, features, and promotions</li>
                <li>To improve the platform and user experience</li>
                <li>To ensure security and prevent fraud</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">4. Sharing of Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share your data with trusted service providers to support our platform,
                with your consent, or when required by law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement reasonable security measures to protect your data. However, no method of transmission over the internet is
                100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                Depending on your location, you may have rights to access, correct, or delete your personal data. Contact us to exercise
                these rights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">7. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under 13. We do not knowingly collect data from children.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">8. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this policy from time to time. We encourage you to review it periodically.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">9. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy, contact us at support@nextstep.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

