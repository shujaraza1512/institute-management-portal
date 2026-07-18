import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Shared password field with a show/hide toggle -- used everywhere a
// password is entered (Login, both change-password forms). The toggle
// only changes the input's type attribute; it never touches the value
// itself, so it can't interfere with validation.
function PasswordInput({ id, label, value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="field-input pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 rounded"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;
