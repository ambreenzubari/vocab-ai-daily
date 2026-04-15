import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VocabAI Daily — One Word, Every Day',
  description:
    'An AI-powered vocabulary website that automatically generates and learns a new English word every single day using Claude AI and GitHub Actions.',
  openGraph: {
    title: 'VocabAI Daily',
    description: 'One new vocabulary word every day, powered by Claude AI.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
