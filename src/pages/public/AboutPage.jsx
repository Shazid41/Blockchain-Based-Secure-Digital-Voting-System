import PageHeader from '../../components/common/PageHeader.jsx';

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A secure voting project for Web Engineering Lab"
        description="This project demonstrates how a digital voting platform can combine verified accounts, protected routes, anonymous ballots, and blockchain-inspired audit records."
      />
      <section className="container-page grid gap-6 py-10 lg:grid-cols-2">
        <article className="card p-6">
          <h2 className="text-xl font-bold text-text">Purpose</h2>
          <p className="mt-3 text-muted">
            The system helps students learn secure web engineering practices through a realistic election workflow:
            registration, email verification, admin approval, voting, and audit verification.
          </p>
        </article>
        <article className="card p-6">
          <h2 className="text-xl font-bold text-text">Limitations</h2>
          <p className="mt-3 text-muted">
            It is an educational prototype. Real public elections require legal compliance, certified identity checks,
            independent security audits, penetration testing, and disaster recovery planning.
          </p>
        </article>
      </section>
    </>
  );
}
