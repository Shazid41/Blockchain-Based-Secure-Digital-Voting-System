const styles = {
  success: 'border-success bg-primary-light text-primary-dark',
  error: 'border-error bg-red-50 text-error',
  warning: 'border-warning bg-amber-50 text-amber-800',
  info: 'border-info bg-blue-50 text-info',
};

export default function AlertMessage({ type = 'info', title, children }) {
  return (
    <div className={`rounded border px-4 py-3 ${styles[type] ?? styles.info}`} role="alert">
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className="text-sm">{children}</div>
    </div>
  );
}
