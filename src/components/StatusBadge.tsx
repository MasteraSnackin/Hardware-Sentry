/**
 * Status Badge Component
 * Beautiful status indicators with subtle glow effects
 */

interface StatusBadgeProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  type,
  children,
  showDot = false,
  className = '',
}: StatusBadgeProps) {
  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
  };

  return (
    <span className={`status-badge status-badge-${type} ${className}`}>
      {showDot && <span className="live-indicator"></span>}
      {!showDot && <span className="text-xs">{iconMap[type]}</span>}
      <span>{children}</span>
    </span>
  );
}
