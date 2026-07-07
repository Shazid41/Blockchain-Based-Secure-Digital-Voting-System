import PageHeader from '../../components/common/PageHeader.jsx';
import useLanguage from '../../hooks/useLanguage.js';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader eyebrow={t('aboutEyebrow')} title={t('aboutTitle')} description={t('aboutDescription')} />
      <section className="container-page grid gap-6 py-10 lg:grid-cols-2">
        <article className="card p-6">
          <h2 className="text-xl font-bold text-text">{t('purpose')}</h2>
          <p className="mt-3 text-muted">{t('purposeText')}</p>
        </article>
        <article className="card p-6">
          <h2 className="text-xl font-bold text-text">{t('safeguards')}</h2>
          <p className="mt-3 text-muted">{t('safeguardsText')}</p>
        </article>
      </section>
    </>
  );
}
