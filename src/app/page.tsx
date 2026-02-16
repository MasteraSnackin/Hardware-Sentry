'use client';

import ScanForm from '@/components/ScanForm';
import ResultsTable from '@/components/ResultsTable';
import BentoCard from '@/components/BentoCard';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';
import GradientText from '@/components/GradientText';

export default function HomePage() {
  return (
    <div className="bento-grid">
      {/* Hero Section - Enhanced with 2026 Gradient Text */}
      <BentoCard delay={0} className="bento-hero">
        <h2 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
          <GradientText>Find Your Hardware</GradientText>
          <br />
          <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            in Seconds ⚡
          </span>
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
          Scan <span className="font-semibold text-gradient">4+ retailers</span> simultaneously for real-time pricing and availability.
        </p>
      </BentoCard>

      {/* Scan Form - Prominent */}
      <BentoCard delay={0.1} className="bento-scan" enableHover3D={false}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Start a Scan
        </h3>
        <ScanForm />
      </BentoCard>

      {/* Info Cards - Sidebar with 2026 Colored Shadows */}
      <BentoCard delay={0.15} className="bento-info-1 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20">
        <div className="text-4xl mb-3 animate-bounce-subtle">⚡</div>
        <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2 text-base">Fast Scans</h4>
        <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
          Results in under <span className="font-semibold text-gradient-info">45 seconds</span> across multiple vendors
        </p>
      </BentoCard>

      <BentoCard delay={0.2} className="bento-info-2 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 hover:shadow-green-500/20 dark:hover:shadow-green-400/20">
        <div className="text-4xl mb-3 animate-bounce-subtle" style={{animationDelay: '0.2s'}}>📊</div>
        <h4 className="font-bold text-green-900 dark:text-green-300 mb-2 text-base">Price Tracking</h4>
        <p className="text-sm text-green-700 dark:text-green-400 leading-relaxed">
          Compare prices and detect <span className="font-semibold text-gradient-success">changes automatically</span>
        </p>
      </BentoCard>

      <BentoCard delay={0.25} className="bento-info-3 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20">
        <div className="text-4xl mb-3 animate-bounce-subtle" style={{animationDelay: '0.4s'}}>🤖</div>
        <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-2 text-base">AI-Powered</h4>
        <p className="text-sm text-purple-700 dark:text-purple-400 leading-relaxed">
          Uses <span className="font-semibold text-gradient">TinyFish Web Agents</span> for reliable extraction
        </p>
      </BentoCard>

      {/* Results Section - Full Width */}
      <ScrollFadeIn className="bento-results" direction="up" delay={0.3}>
        <ResultsTable />
      </ScrollFadeIn>
    </div>
  );
}
