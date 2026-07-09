const STATUS_STYLES = {
  pending: 'bg-pending/10 text-pending',
  approved: 'bg-approve/10 text-approve',
  rejected: 'bg-reject/10 text-reject',
};

function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-card text-xs font-medium capitalize ${STATUS_STYLES[status] || 'bg-navy-100 text-navy-700'}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
