import useLanguage from '../../hooks/useLanguage.js';

const badgeStyles = {
  approved: 'bg-primary-light text-primary-dark',
  active: 'bg-primary-light text-primary-dark',
  verified: 'bg-primary-light text-primary-dark',
  pending: 'bg-blue-50 text-info',
  suspended: 'bg-red-50 text-error',
  rejected: 'bg-red-50 text-error',
  warning: 'bg-amber-50 text-amber-800',
};

export default function StatusBadge({ status }) {
  const { t } = useLanguage();
  const label = status ? t(status) : '';

  return (
    <span
      className={`inline-flex items-center rounded px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        badgeStyles[status] ?? 'bg-gray-100 text-muted'
      }`}
    >
      {label}
    </span>
  );
}
