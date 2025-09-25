// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Layout from './components/Layout';
import localFont from 'next/font/local';

const nexaFont = localFont({
  src: './fonts/NexaRegular.otf',
  display: 'swap',
  variable: '--nexa',
});

export const metadata: Metadata = {
  title: 'FIM Dashboard',
  description: 'File Integrity Monitoring Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={nexaFont.variable}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
