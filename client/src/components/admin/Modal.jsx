import { X } from 'lucide-react';

// Simple centered modal used by every Admin CRUD page's create/edit form,
// so each page doesn't reimplement its own overlay/close logic.
function Modal({ title, onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-navy-900/40" onClick={onClose}>
      <div
        className={`bg-white rounded-card shadow-card w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
          <p className="font-display text-navy-800">{title}</p>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
