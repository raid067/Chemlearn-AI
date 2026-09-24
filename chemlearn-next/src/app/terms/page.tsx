import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, Scale, ArrowLeft, Building2, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service & User Agreement | ChemLearn AI',
  description: 'Terms of Service, acceptable use guidelines, Malaysian legal jurisdiction, and educational disclaimers for ChemLearn AI.',
  alternates: {
    canonical: 'https://chemlearn-67.web.app/terms',
  },
  openGraph: {
    title: 'Terms of Service | ChemLearn AI',
    description: 'User agreement, KSSM curriculum disclaimers, and legal policies for ChemLearn Educational Technologies Sdn. Bhd.',
    url: 'https://chemlearn-67.web.app/terms',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navigation */}
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
            <Scale className="w-3.5 h-3.5" />
            Governing Law: Malaysia
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="bg-white border-b border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold tracking-wide uppercase mb-3">
            User Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Effective Date: 3 September 2026 • Governing Jurisdiction: Courts of Malaysia (Kuala Lumpur)
          </p>
        </div>
      </header>

      {/* Main Content Article */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed">
          <p className="lead text-lg text-slate-700 font-medium">
            Welcome to ChemLearn AI. These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Student&rdquo;, or &ldquo;You&rdquo;) and <strong>ChemLearn Educational Technologies Sdn. Bhd.</strong> (SSM: 202401038492 / 1542381-X) (&ldquo;Company&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo;, or &ldquo;ChemLearn&rdquo;). By accessing or using our website, interactive simulations, and AI-assisted educational tools, you agree to be bound by these Terms.
          </p>

          {/* Curriculum Disclaimer Box */}
          <div className="not-prose my-8 p-5 rounded-2xl bg-amber-50 border-l-4 border-amber-500 text-amber-950 text-sm leading-relaxed shadow-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-900 block mb-1">
                IMPORTANT CURRICULUM &amp; REGULATORY DISCLAIMER:
              </strong>
              ChemLearn AI is an independent supplementary revision platform developed to assist students studying the Malaysian Kurikulum Standard Sekolah Menengah (KSSM) Form 4 and Form 5 Chemistry syllabus. ChemLearn AI is NOT affiliated with, sponsored by, endorsed by, or authorized by Lembaga Peperiksaan Malaysia (LPM), Majlis Peperiksaan Malaysia (MPM), or Kementerian Pendidikan Malaysia (KPM). The official Sijil Pelajaran Malaysia (SPM) examination questions and marking schemes are determined solely by authorized government authorities.
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            1. User Eligibility &amp; Account Responsibility
          </h2>
          <p>
            You must be at least 13 years of age to register for an account. If you are under 18 years of age, you confirm that you have obtained the consent of a parent or legal guardian to use the platform. You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Provide accurate, current registration details (email and display name).</li>
            <li>Maintain the strict confidentiality of your authentication credentials.</li>
            <li>
              Notify us immediately at{' '}
              <a href="mailto:security@chemlearn.my" className="text-purple-600 hover:underline">
                security@chemlearn.my
              </a>{' '}
              if you suspect any unauthorized access to your account.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            2. User Warranties &amp; Acceptable Use
          </h2>
          <p>You expressly warrant that you will not:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Attempt to bypass, disable, or tamper with security controls, distributed rate limiters, or Firestore database security rules.</li>
            <li>Use automated scripts, bots, spiders, or scrapers to extract curriculum materials, simulation logic, or user records.</li>
            <li>Upload or submit malicious payloads, prompt injection vectors, cross-site scripting (XSS) inputs, or defamatory content through feedback forms or AI prompt inputs.</li>
            <li>Engage in reverse engineering, decompilation, or unauthorized reproduction of ChemLearn&apos;s proprietary simulation algorithms, including the qualitative salt analysis matrix, lattice physics modeler, and gamification state engine.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            3. Intellectual Property Rights
          </h2>
          <p>
            All software code, visual assets, 3D Canvas simulations, SVG animations, user interface designs, lesson summaries, and proprietary scoring algorithms are the exclusive intellectual property of ChemLearn Educational Technologies Sdn. Bhd. and are protected under the Malaysian Copyright Act 1987 and applicable international intellectual property treaties.
          </p>
          <p>
            Users are granted a limited, non-exclusive, non-transferable, revocable license to access the content solely for personal, non-commercial academic revision.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            4. AI Tutor &amp; Essay Grader Disclaimer
          </h2>
          <p>
            The Essay Grader and ChemLearn AI Tutor utilize Google Gemini generative models to provide real-time educational feedback. While we implement strict system prompts aligned with the KSSM marking rubric (Fact, Explanation, Keyword, Application framework):
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>AI evaluation scores and annotations are provided strictly for practice and formative self-assessment.</li>
            <li>ChemLearn does not guarantee that a score achieved in our automated grader will mirror your official SPM examination results.</li>
            <li>Students are strongly encouraged to consult their certified school teachers for official grading advice and Paper 2/3 essay guidance.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            5. Service Availability &amp; Modifications
          </h2>
          <p>
            ChemLearn AI is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. We reserve the right to modify, update, or temporarily suspend features (such as real-time chemical duels or AI tutor endpoints) for scheduled maintenance, security hardening, or infrastructure enhancements without prior notice.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            6. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable Malaysian law, ChemLearn Educational Technologies Sdn. Bhd., its directors, officers, and employees shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the platform, including but not limited to examination performance, loss of study data, or service interruptions.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            7. Governing Law &amp; Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Malaysia. Any legal action or dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the Courts of Malaysia situated in Kuala Lumpur.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">
            8. Legal Inquiries &amp; Contact
          </h2>
          <div className="not-prose my-4 p-5 rounded-xl bg-white border border-slate-200 text-sm space-y-2 text-slate-700 shadow-xs">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong>Company:</strong> ChemLearn Educational Technologies Sdn. Bhd.<br />
                <strong>Registered Office:</strong> Level 14, Menara Southgate, No. 2 Jalan Dua, Off Jalan Chan Sow Lin, 55200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <Mail className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <strong>Legal Department:</strong>{' '}
                <a href="mailto:legal@chemlearn.my" className="text-purple-600 hover:underline">
                  legal@chemlearn.my
                </a>
              </div>
            </div>
          </div>
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
