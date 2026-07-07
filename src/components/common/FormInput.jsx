export default function FormInput({ id, label, error, help, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-text">
        {label}
      </label>
      <input
        id={id}
        className={`focus-ring min-h-12 w-full rounded border bg-white px-4 py-3 text-text outline-none transition ${
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
