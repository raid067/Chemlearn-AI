import { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Red Team & AI Security Evaluation | ChemLearn AI Admin',
  description: 'Automated adversary evaluation, prompt injection resistance, SPM Chemistry accuracy, and zero-trust security audits.',
};

export default function RedTeamDashboardPage() {
  return <ClientPage />;
}
