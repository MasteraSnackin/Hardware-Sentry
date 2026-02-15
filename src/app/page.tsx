import ScanForm from '@/components/ScanForm';
import ResultsTable from '@/components/ResultsTable';

export default function HomePage() {
  return (
    <div className="bento-grid">
      {/* Hero Section - Compact */}
      <div className="bento-hero glass-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Find Your Hardware in Seconds
        </h2>
        <p className="text-sm text-gray-600">
          Scan 4+ retailers simultaneously for real-time pricing and availability.
        </p>
      </div>

      {/* Scan Form - Prominent */}
      <div className="bento-scan glass-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Start a Scan
        </h3>
        <ScanForm />
      </div>

      {/* Info Cards - Sidebar */}
      <div className="bento-info-1 glass-card bg-gradient-to-br from-blue-50 to-blue-100/50">
        <div className="text-3xl mb-2">⚡</div>
        <h4 className="font-semibold text-blue-900 mb-1">Fast Scans</h4>
        <p className="text-sm text-blue-700">
          Results in under 45 seconds across multiple vendors
        </p>
      </div>

      <div className="bento-info-2 glass-card bg-gradient-to-br from-green-50 to-green-100/50">
        <div className="text-3xl mb-2">📊</div>
        <h4 className="font-semibold text-green-900 mb-1">Price Tracking</h4>
        <p className="text-sm text-green-700">
          Compare prices and detect changes automatically
        </p>
      </div>

      <div className="bento-info-3 glass-card bg-gradient-to-br from-purple-50 to-purple-100/50">
        <div className="text-3xl mb-2">🤖</div>
        <h4 className="font-semibold text-purple-900 mb-1">AI-Powered</h4>
        <p className="text-sm text-purple-700">
          Uses TinyFish Web Agents for reliable extraction
        </p>
      </div>

      {/* Results Section - Full Width */}
      <div className="bento-results">
        <ResultsTable />
      </div>
    </div>
  );
}
