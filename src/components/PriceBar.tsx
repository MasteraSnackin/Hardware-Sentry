'use client';

import { motion } from 'framer-motion';

interface PriceBarProps {
  price: number;
  maxPrice: number;
  minPrice: number;
  currency: string;
  isBestDeal?: boolean;
}

/**
 * Phase 4: Visual price comparison bar
 *
 * Shows relative price as a visual bar
 */
export function PriceBar({
  price,
  maxPrice,
  minPrice,
  currency,
  isBestDeal = false,
}: PriceBarProps) {
  const range = maxPrice - minPrice;
  const percentage = range > 0 ? ((price - minPrice) / range) * 100 : 50;

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            isBestDeal
              ? 'bg-gradient-to-r from-green-400 to-green-600'
              : 'bg-gradient-to-r from-blue-400 to-blue-600'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            delay: 0.2,
          }}
        />
      </div>
      {isBestDeal && (
        <motion.span
          className="text-xs font-bold text-green-600 dark:text-green-400"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15,
            delay: 0.4,
          }}
        >
          🏆 Best
        </motion.span>
      )}
    </div>
  );
}
