import { AlertCircle } from 'lucide-react';

function ErrorState({ message = "Something went wrong. Please try again.", onRetry }) {
  return (
    <div className="text-center py-16" role="alert">
      <AlertCircle className="w-8 h-8 text-reject/70 mx-auto mb-3" aria-hidden="true" />
      <p className="text-sm text-reject">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-link mt-3">
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
