function SummaryCard({ icon: Icon, label, value, sublabel }) {
  return (
    <div className="bg-white rounded-card shadow-card p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-card bg-navy-100 text-navy-700 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted truncate">{label}</p>
          <p className="text-lg font-display text-navy-800 truncate">{value}</p>
        </div>
      </div>
      {sublabel && <p className="text-xs text-muted mt-2">{sublabel}</p>}
    </div>
  );
}

export default SummaryCard;
