function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="text-center py-16">
      <p className="text-sm text-reject">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-sm text-navy-700 underline hover:text-navy-800">
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
