function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-16">
      {Icon && (
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy-50 mb-3">
          <Icon className="w-7 h-7 text-navy-300" aria-hidden="true" />
        </span>
      )}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-muted mt-1 max-w-xs mx-auto">{description}</p>}
    </div>
  );
}

export default EmptyState;
