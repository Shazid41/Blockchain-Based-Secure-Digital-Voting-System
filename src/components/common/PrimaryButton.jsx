export default function PrimaryButton({ children, className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary via-[#0B7A59] to-[#16834A] px-4 py-2.5 text-sm font-bold text-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-glow active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:px-5 sm:py-3 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
