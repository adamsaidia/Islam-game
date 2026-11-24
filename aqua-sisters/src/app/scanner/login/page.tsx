import type { Metadata } from 'next';
import { LoginForm } from '@/components/LoginForm';

export const metadata: Metadata = { title: 'Scanner', robots: { index: false } };

export default function ScannerLogin() {
  return <LoginForm title="Scanner" next="/scanner" />;
}
