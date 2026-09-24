import { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Admin Command Center | ChemLearn AI',
  description: 'System overview, student metrics, feedback triage, and security audit telemetry.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <ClientPage />;
}
