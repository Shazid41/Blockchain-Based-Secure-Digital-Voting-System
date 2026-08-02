export default function SecondaryButton({ children, className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary/70 bg-white/90 px-4 py-2.5 text-sm font-bold text-primary shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary hover:bg-primary-light hover:shadow-soft active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:px-5 sm:py-3 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
