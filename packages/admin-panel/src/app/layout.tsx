import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './providers';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Afrify Admin - Platform Management',
  description: 'Admin panel for managing the Afrify e-commerce platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
