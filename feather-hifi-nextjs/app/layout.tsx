import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feather — Group Project Dashboard',
  description: 'Hi-fi prototype for a university group work management app.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
