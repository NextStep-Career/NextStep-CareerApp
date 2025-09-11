import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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

      {/* Terms Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-space-grotesk)] mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <div>
              <p className="text-lg text-muted-foreground">
                Effective Date: January 1, 2024
              </p>
              <p className="text-lg text-muted-foreground">
                Last Updated: January 1, 2024
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using NextStep ("the Service"), you agree to be bound by these Terms of Service 
                ("Terms"). If you do not agree to these Terms, please do not use the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                2. Description of Service
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                NextStep is a career guidance platform that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Personality and career assessment quizzes</li>
                <li>AI-powered career coaching</li>
                <li>Personalized career path recommendations</li>
                <li>Educational resources and learning paths</li>
                <li>Progress tracking tools</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                3. User Accounts
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Be responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                4. User Conduct
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Transmit any harmful code or malware</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Share false or misleading information</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                5. Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, features, and functionality of NextStep, including but not limited to text, graphics, 
                logos, and software, are owned by NextStep or its licensors and are protected by intellectual 
                property laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                6. Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of the Service is also governed by our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms by reference.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                7. Disclaimers
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                NextStep provides career guidance and educational resources for informational purposes only. 
                We do not guarantee employment outcomes or career success. The Service is provided "as is" 
                without warranties of any kind.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                8. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, NextStep shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages arising from your use of the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                9. Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material 
                changes via email or through the Service. Continued use of the Service after changes 
                constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                10. Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about these Terms, please contact us at:
              </p>
              <p className="text-muted-foreground">
                Email: support@nextstep.com<br />
                Address: NextStep, 123 Career Path Lane, San Francisco, CA 94105
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
