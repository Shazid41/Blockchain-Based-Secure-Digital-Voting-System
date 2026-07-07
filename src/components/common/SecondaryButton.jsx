export default function SecondaryButton({ children, className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary bg-white/85 px-5 py-3 text-sm font-bold text-primary shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
