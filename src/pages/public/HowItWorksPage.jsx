import PageHeader from '../../components/common/PageHeader.jsx';
import useLanguage from '../../hooks/useLanguage.js';

const stepKeys = ['processRegister', 'processVerify', 'processApproval', 'processElection', 'processVote', 'processReceipt'];

export default function HowItWorksPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader eyebrow={t('processEyebrow')} title={t('processTitle')} description={t('processDescription')} />
      <section className="container-page py-10">
        <ol className="grid gap-4 md:grid-cols-2">
          {stepKeys.map((step, index) => (
            <li key={step} className="card flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#20A06F] text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h2 className="font-bold text-text">{t(step)}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{t(index === 0 ? 'registrationDescription' : index === 5 ? 'securityAssuranceText' : 'visitorMessage')}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
