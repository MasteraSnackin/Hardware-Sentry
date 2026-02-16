/**
 * Enhanced Skeleton Loader Component
 * Modern loading states with shimmer animations
 */

interface SkeletonLoaderProps {
  variant?: 'text' | 'avatar' | 'card' | 'table';
  count?: number;
  className?: string;
}

export function SkeletonLoader({
  variant = 'text',
  count = 1,
  className = '',
}: SkeletonLoaderProps) {
  if (variant === 'table') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 animate-breathe"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="skeleton-avatar"></div>
            <div className="flex-1 space-y-2">
              <div className="skeleton-text w-3/4"></div>
              <div className="skeleton-text w-1/2"></div>
            </div>
            <div className="skeleton-text w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`glass-card ${className}`}>
        <div className="space-y-4">
          <div className="skeleton-text w-1/3 h-6"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-5/6"></div>
          <div className="skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="skeleton-avatar"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton-text w-32"></div>
          <div className="skeleton-text w-24"></div>
        </div>
      </div>
    );
  }

  // Default: text variant
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-text"
          style={{
            width: `${Math.random() * 30 + 70}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        ></div>
      ))}
    </div>
  );
}
