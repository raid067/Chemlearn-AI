import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Mail, Building2, Lock, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy & Personal Data Notice | ChemLearn AI',
  description: 'Official Privacy Policy and Personal Data Protection Act (PDPA 2010) compliance disclosure for ChemLearn Educational Technologies Sdn. Bhd.',
  alternates: {
    canonical: 'https://chemlearn-67.web.app/privacy',
  },
  openGraph: {
    title: 'Privacy Policy & Data Protection | ChemLearn AI',
    description: 'Learn how ChemLearn AI protects student privacy, complies with Malaysian PDPA 2010, and safeguards educational data.',
    url: 'https://chemlearn-67.web.app/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Header Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to ChemLearn AI
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            PDPA 2010 Compliant
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="bg-white border-b border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold tracking-wide uppercase mb-3">
            Legal &amp; Privacy Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy &amp; Personal Data Notice
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Effective Date: 3 September 2026 • Governed by the Malaysian Personal Data Protection Act 2010 (PDPA)
          </p>
        </div>
      </header>

      {/* Main Content Article */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed">
          {/* Executive Summary Box */}
          <div className="not-prose mb-8 p-5 rounded-2xl bg-purple-50 border-l-4 border-purple-600 text-purple-950 text-sm leading-relaxed shadow-xs">
            <strong className="font-bold text-purple-900">Executive Summary:</strong> ChemLearn Educational Technologies Sdn. Bhd. is committed to protecting student data privacy. We collect only what is strictly necessary to authenticate users, deliver personalized SPM Chemistry revision, and evaluate essays against exam rubrics. We do not sell personal data to advertisers.
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            1. Data Controller Identity &amp; Contact Information
          </h2>
          <p>
            The data controller responsible for the processing of your personal information under this platform is:
          </p>
          <div className="not-prose my-4 p-5 rounded-xl bg-white border border-slate-200 text-sm space-y-2 text-slate-700 shadow-xs">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong>Company Name:</strong> ChemLearn Educational Technologies Sdn. Bhd.<br />
                <strong>SSM Registration Number:</strong> 202401038492 (1542381-X)<br />
                <strong>Registered Office:</strong> Level 14, Menara Southgate, No. 2 Jalan Dua, Off Jalan Chan Sow Lin, 55200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <Mail className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <strong>Official Inquiries:</strong>{' '}
                <a href="mailto:support@chemlearn.my" className="text-purple-600 hover:underline">
                  support@chemlearn.my
                </a>{' '}
                • <strong>Data Protection Officer (DPO):</strong>{' '}
                <a href="mailto:dpo@chemlearn.my" className="text-purple-600 hover:underline">
                  dpo@chemlearn.my
                </a>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            2. Categories of Personal Data Collected
          </h2>
          <p>We process the following categories of information when you interact with ChemLearn AI:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Account Data:</strong> Full name, email address, password hashes (managed cryptographically through Google Firebase Authentication; passwords are never stored in plain text).
            </li>
            <li>
              <strong>Academic &amp; Telemetry Data:</strong> Grade level (e.g., Form 4 / Form 5), quiz answers and completion timestamps, virtual laboratory experiment records (e.g., qualitative salt analysis steps), and study streak counts.
            </li>
            <li>
              <strong>AI Interaction Logs:</strong> Chemistry queries and answers submitted to the ChemLearn AI Tutor and Essay Grader to provide pedagogical feedback.
            </li>
            <li>
              <strong>Technical &amp; Device Information:</strong> IP address, user-agent string, browser version, and operating system collected for security audits and distributed rate-limiting enforcement.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            3. Legal Basis for Processing (PDPA 2010 &amp; GDPR)
          </h2>
          <p>We process personal data on the following legal bases:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Consent:</strong> Explicitly obtained during account registration and cookie preference configuration.
            </li>
            <li>
              <strong>Performance of Educational Contract:</strong> Providing you with access to simulated laboratories, quiz score tracking, and automated KSSM essay evaluations.
            </li>
            <li>
              <strong>Legitimate Interests:</strong> Protecting the integrity and security of our educational infrastructure against brute-force attacks and abuse via Firebase App Check and Upstash Redis distributed rate limiters.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            4. Third-Party Sub-Processors &amp; Cloud Infrastructure
          </h2>
          <p>
            We partner with vetted infrastructure providers adhering to ISO/IEC 27001, SOC 2, and rigorous data protection standards:
          </p>

          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse bg-white rounded-xl border border-slate-200 shadow-xs">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 border-r border-slate-200">Sub-Processor</th>
                  <th className="px-4 py-3 border-r border-slate-200">Role / Service</th>
                  <th className="px-4 py-3 border-r border-slate-200">Data Transferred</th>
                  <th className="px-4 py-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-200">Google LLC (Firebase)</td>
                  <td className="px-4 py-3 border-r border-slate-200">Identity authentication, Cloud Firestore database, and edge hosting</td>
                  <td className="px-4 py-3 border-r border-slate-200">User UID, encrypted credentials, assessment records</td>
                  <td className="px-4 py-3">Singapore / USA</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-200">Google Cloud (Gemini API)</td>
                  <td className="px-4 py-3 border-r border-slate-200">Generative AI tutoring and SPM essay rubric scoring</td>
                  <td className="px-4 py-3 border-r border-slate-200">Anonymized essay text and chemistry prompts</td>
                  <td className="px-4 py-3">USA</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-200">Google reCAPTCHA v3</td>
                  <td className="px-4 py-3 border-r border-slate-200">App Check bot prevention and anti-abuse verification</td>
                  <td className="px-4 py-3 border-r border-slate-200">Browser telemetry and interaction risk scores</td>
                  <td className="px-4 py-3">Global Edge</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-200">Upstash Inc.</td>
                  <td className="px-4 py-3 border-r border-slate-200">Serverless Redis distributed rate limiter</td>
                  <td className="px-4 py-3 border-r border-slate-200">Hashed user identifiers and client IP addresses</td>
                  <td className="px-4 py-3">Singapore / USA</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            5. Cookies &amp; Local Storage Usage
          </h2>
          <p>ChemLearn AI uses minimal, purpose-specific storage technologies:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Strictly Necessary:</strong> Firebase Auth tokens (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">__session</code>) required to keep your student dashboard logged in securely.
            </li>
            <li>
              <strong>Functional Storage (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">localStorage</code>):</strong> Persisting your theme preference, offline review records, flashcard spaced repetition intervals (SM-2 engine), and cookie consent preferences.
            </li>
            <li>
              <strong>Analytics (Optional):</strong> Aggregate page views and feature engagement, loaded only upon receiving your explicit consent.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            6. Data Security &amp; Encryption Standards
          </h2>
          <div className="not-prose my-4 p-5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-xs">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 leading-relaxed">
              All data transmitted between your device and our platform is encrypted in transit using <strong>Transport Layer Security (TLS 1.3)</strong>. Database records stored in Cloud Firestore are encrypted at rest using <strong>256-bit Advanced Encryption Standard (AES-256)</strong>. Database read and write operations are guarded on the server runtime via zero-trust Firestore Security Rules.
            </p>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            7. Data Subject Rights (Access, Correction &amp; Erasure)
          </h2>
          <p>Under the Malaysian PDPA 2010 and international privacy frameworks, you have the right to:</p>
          <ol className="list-decimal pl-6 space-y-2 mb-6">
            <li><strong>Access:</strong> Request a copy of all personal data held about you in machine-readable format.</li>
            <li><strong>Correction:</strong> Update inaccurate or incomplete profile information directly via the dashboard or support.</li>
            <li><strong>Withdrawal of Consent:</strong> Revoke consent for optional analytics or marketing communications at any time.</li>
            <li><strong>Erasure / Account Deletion:</strong> Request the complete permanent purging of your student profile, chat histories, and quiz logs.</li>
          </ol>
          <p>
            To exercise any of these rights, contact our Data Protection Officer at{' '}
            <a href="mailto:dpo@chemlearn.my" className="text-purple-600 font-semibold hover:underline">
              dpo@chemlearn.my
            </a>. We respond to all verified requests within <strong>21 business days</strong>.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            8. Student &amp; Minor Protection
          </h2>
          <p>
            ChemLearn AI is an educational platform designed for secondary school students (typically ages 16–18). We do not market commercial non-educational products to minors. If a parent or legal guardian believes their child has registered without proper authorization, please email{' '}
            <a href="mailto:support@chemlearn.my" className="text-purple-600 font-semibold hover:underline">
              support@chemlearn.my
            </a>{' '}
            for immediate account removal.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            9. Policy Updates
          </h2>
          <p>
            We may revise this Privacy Policy periodically to reflect technological improvements or legislative amendments. Any material modifications will be announced via an in-app notification banner 14 days prior to taking effect.
          </p>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
        <p>&copy; 2026 ChemLearn Educational Technologies Sdn. Bhd. (SSM: 202401038492). All rights reserved.</p>
        <p className="mt-1">
          Independent supplementary revision software aligned with KSSM curriculum. Not affiliated with Lembaga Peperiksaan Malaysia.
        </p>
      </footer>
    </div>
  );
}
