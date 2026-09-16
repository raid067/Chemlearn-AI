import { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Red Team Vulnerability History | ChemLearn AI Admin',
  description: 'Track security score trends, compare releases, and verify regression defenses across past audits.',
};

export default function RedTeamHistoryPage() {
  return <ClientPage />;
}
