export default function SelectInput({ id, label, options = [], error, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-text">
        {label}
      </label>
      <select
        id={id}
        className={`focus-ring min-h-12 w-full rounded border bg-white px-4 py-3 text-text outline-none transition ${
          error ? 'border-error' : 'border-border focus:border-primary'
        }`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        <option value="">Select one</option>
        {options.map((option) => (
          <option key={option.id ?? option.value} value={option.id ?? option.value}>
            {option.name ?? option.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-sm font-medium text-error">{error}</p> : null}
    </div>
  );
}
