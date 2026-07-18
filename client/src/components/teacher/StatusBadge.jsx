import { Clock, CheckCircle2, XCircle } from 'lucide-react';

// Colors come entirely from the shared design tokens (approve/pending/
// reject in tailwind.config.js), so this component never needs to change
// when the palette does. Icons are paired with each status so meaning
// doesn't rely on color alone (accessibility) -- useful given the whole
// app is now built from a 2-hue palette rather than traffic-light colors.
const STATUS_CONFIG = {
  pending: { icon: Clock, classes: 'bg-pending/10 text-pending' },
  approved: { icon: CheckCircle2, classes: 'bg-approve/10 text-approve' },
  rejected: { icon: XCircle, classes: 'bg-reject/10 text-reject' },
};

function StatusBadge({ status }) {
  if (!status) return null;
  const config = STATUS_CONFIG[status];
  if (!config) {
    return <span className="inline-block px-2 py-0.5 rounded-card text-xs font-medium capitalize bg-navy-100 text-navy-700">{status}</span>;
  }

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-card text-xs font-medium capitalize ${config.classes}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {status}
    </span>
  );
}

export default StatusBadge;
