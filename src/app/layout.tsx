import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Hardware Sentry - Real-time Board Availability Tracker',
  description:
    'Track real-time availability and pricing for Raspberry Pi 5, Jetson Orin, and other developer boards across multiple retailers.',
  keywords: [
    'Raspberry Pi',
    'Jetson Orin',
    'hardware availability',
    'price tracker',
    'stock checker',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased text-gray-900">
        <header className="glass-card sticky top-0 z-50 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              🔍 Hardware Sentry
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time availability tracker for developer boards
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="mt-16 glass-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
            Built with{' '}
            <a
              href="https://tinyfish.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline hover:text-blue-700 transition-colors"
            >
              TinyFish Web Agents
            </a>{' '}
            | Web Agents Hackathon Feb 2026
          </div>
        </footer>

        <div id="toast-container" className="fixed top-4 right-4 z-[100] space-y-2"></div>
      </body>
    </html>
  );
}
