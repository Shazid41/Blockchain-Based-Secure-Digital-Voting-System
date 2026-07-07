import PageHeader from '../../components/common/PageHeader.jsx';
import useLanguage from '../../hooks/useLanguage.js';

const itemKeys = [
  ['secureRegistration', 'registrationDescription'],
  ['emailVerification', 'approvalWarning'],
  ['anonymousVoting', 'securityAssuranceText'],
  ['oneVoterOneVote', 'noticeText'],
  ['blockchainVerification', 'securityAssuranceText'],
  ['fraudDetection', 'securityDescription'],
];

export default function SecurityPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader eyebrow={t('securityEyebrow')} title={t('securityTitle')} description={t('securityDescription')} />
      <section className="container-page grid gap-4 py-10 md:grid-cols-2">
        {itemKeys.map(([title, description]) => (
          <article key={title} className="card p-5">
            <h2 className="font-bold text-text">{t(title)}</h2>
            <p className="mt-2 text-muted">{t(description)}</p>
          </article>
        ))}
      </section>
    </>
  );
}
