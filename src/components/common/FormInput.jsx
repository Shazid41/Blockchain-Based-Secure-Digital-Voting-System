export default function FormInput({ id, label, error, help, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-text">
        {label}
      </label>
      <input
        id={id}
        className={`focus-ring min-h-11 w-full rounded-lg border bg-white/90 px-3 py-2.5 text-text shadow-sm outline-none transition hover:shadow-soft sm:min-h-12 sm:px-4 sm:py-3 ${
          error ? 'border-error' : 'border-border focus:border-primary'
        }`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : help ? `${id}-help` : undefined}
        {...props}
      />
      {help && !error ? (
        <p id={`${id}-help`} className="mt-1 text-sm text-muted">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
