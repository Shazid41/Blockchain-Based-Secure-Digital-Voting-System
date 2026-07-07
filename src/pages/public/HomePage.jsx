import { BarChart3, CheckCircle2, Fingerprint, LockKeyhole, MailCheck, ShieldCheck, Vote } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { PROJECT } from '../../utils/constants.js';

const features = [
  ['Secure Registration', <LockKeyhole key="registration" className="text-primary" aria-hidden="true" />],
  ['Email Verification', <MailCheck key="email" className="text-primary" aria-hidden="true" />],
  ['Anonymous Voting', <Fingerprint key="anonymous" className="text-primary" aria-hidden="true" />],
  ['One Voter, One Vote', <Vote key="vote" className="text-primary" aria-hidden="true" />],
  ['Blockchain Verification', <ShieldCheck key="blockchain" className="text-primary" aria-hidden="true" />],
  ['Real-Time Results', <BarChart3 key="results" className="text-primary" aria-hidden="true" />],
  ['Fraud Detection', <CheckCircle2 key="fraud" className="text-primary" aria-hidden="true" />],
];

const steps = ['Register', 'Verify Email', 'Wait for Approval', 'Select Election', 'Cast Vote', 'Verify Receipt'];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border bg-white">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">{PROJECT.university}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight text-text sm:text-5xl">
              {PROJECT.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              A university Web Engineering Lab project for secure voter registration, verified login, anonymous ballots,
              blockchain-style vote storage, and simple election analytics.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton className="sm:w-auto">
                <Link to="/voter">View Elections</Link>
              </PrimaryButton>
              <SecondaryButton>
                <Link to="/how-it-works">How Voting Works</Link>
              </SecondaryButton>
            </div>
          </div>
          <div className="card bg-primary-light p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary-dark">Active election preview</p>
                <h2 className="mt-2 text-2xl font-bold text-text">Student Council Election 2026</h2>
              </div>
              <StatusBadge status="active" />
            </div>
            <div className="mt-6 grid gap-3 text-sm text-muted">
              <p>Region: Central Region</p>
              <p>Result visibility: Live for authorized users</p>
              <p>Security: Email verified and admin approved voters only</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="card border-warning bg-amber-50 p-5">
          <h2 className="font-bold text-text">Important Notice</h2>
          <p className="mt-2 text-muted">
            This is an academic project. It is not suitable for real government elections without certified identity
            verification, formal security audits, legal approval, and independent infrastructure review.
          </p>
        </div>
      </section>

      <section className="container-page pb-12">
        <PageHeader title="Core Features" description="Simple, secure, and verifiable features for a lab demonstration." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([label, icon]) => (
            <article key={label} className="card p-5">
              {icon}
              <h3 className="mt-4 font-bold text-text">{label}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-white py-12">
        <div className="container-page">
          <h2 className="text-2xl font-bold text-text">Voting Process</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="card flex items-center gap-4 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="font-semibold text-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-6 py-12 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-text">Security Assurance</h2>
          <p className="mt-3 text-muted">
            Ballots do not store name, email, phone, or NID directly. Vote blocks use SHA-256 hashes and previous block
            references so tampering can be detected during audit verification.
          </p>
        </div>
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-text">Help</h2>
          <p className="mt-3 text-muted">
            New voters register with email, phone, and a 10 or 16 digit voter number. Admin approval is required before
            voting access is granted.
          </p>
        </div>
      </section>
    </>
  );
}
