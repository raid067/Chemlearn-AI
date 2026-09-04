interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: string;
  className?: string;
}

export function ProgressBar({ progress, color = '#6d28d9', height = 'h-2', className = '' }: ProgressBarProps) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ backgroundColor: color, width: `${safeProgress}%` }}
      />
    </div>
  );
}
