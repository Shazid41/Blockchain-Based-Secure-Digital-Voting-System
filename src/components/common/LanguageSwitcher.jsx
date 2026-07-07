export default function LanguageSwitcher() {
  return (
    <div className="inline-flex rounded border border-border bg-white p-1" aria-label="Language selector">
      <button className="focus-ring rounded bg-primary px-3 py-1 text-sm font-semibold text-white">EN</button>
      <button className="focus-ring rounded px-3 py-1 text-sm font-semibold text-muted">বাংলা</button>
    </div>
  );
}
