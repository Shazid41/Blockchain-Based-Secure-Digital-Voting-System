import useLanguage from '../../hooks/useLanguage.js';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex rounded-lg border border-white/60 bg-white/80 p-1 shadow-soft backdrop-blur" aria-label="Language selector">
      <button
        type="button"
        className={`focus-ring rounded-md px-3 py-1 text-sm font-bold transition ${language === 'en' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-primary-light hover:text-primary'}`}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={`focus-ring rounded-md px-3 py-1 text-sm font-bold transition ${language === 'bn' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-primary-light hover:text-primary'}`}
        onClick={() => setLanguage('bn')}
      >
        বাংলা
      </button>
    </div>
  );
}
