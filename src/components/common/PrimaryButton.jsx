export default function PrimaryButton({ children, className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-[#16834A] px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
