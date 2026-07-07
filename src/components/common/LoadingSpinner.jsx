export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3 text-primary" role="status">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary-light border-t-primary" />
      <span className="font-medium">{label}</span>
    </div>
  );
}
