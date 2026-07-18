function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-16 text-muted text-sm" role="status" aria-live="polite">
      <span className="w-4 h-4 border-2 border-navy-200 border-t-navy-700 rounded-full animate-spin mr-2" aria-hidden="true" />
      {label}
    </div>
  );
}

export default LoadingState;
