import PageHeader from '../../components/common/PageHeader.jsx';

const items = [
  ['Secure login', 'Supabase Auth handles email, password, session persistence, and password reset.'],
  ['Email verification', 'Accounts must verify email before they can be trusted for voting workflows.'],
  ['Role-based access', 'Voter, admin, and auditor routes are separated with protected route wrappers.'],
  ['Anonymous ballots', 'Ballots do not store voter name, email, phone, or voter number.'],
  ['One voter, one vote', 'The database design prepares eligibility rows and unique voting checks for later phases.'],
  ['Blockchain-style audit trail', 'Vote blocks will link through SHA-256 hashes in the voting phase.'],
  ['Fraud logs', 'Rule-based fraud events will be logged for suspicious access and voting attempts.'],
];

export default function SecurityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Security approach for the academic prototype"
        description="This project uses practical, explainable security controls. Biometric login is not implemented in Step 1; WebAuthn, passkeys, and device biometric support are documented as future scope."
      />
      <section className="container-page grid gap-4 py-10 md:grid-cols-2">
        {items.map(([title, description]) => (
          <article key={title} className="card p-5">
            <h2 className="font-bold text-text">{title}</h2>
            <p className="mt-2 text-muted">{description}</p>
          </article>
        ))}
      </section>
    </>
  );
}
