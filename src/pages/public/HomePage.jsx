import { BarChart3, CheckCircle2, Fingerprint, LockKeyhole, MailCheck, ShieldCheck, Timer, Trophy, Vote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import useLanguage from '../../hooks/useLanguage.js';
import { listPublicElectionDashboard } from '../../services/publicDashboardService.js';

const featureKeys = [
  ['secureRegistration', <LockKeyhole key="registration" className="text-primary" aria-hidden="true" />],
  ['emailVerification', <MailCheck key="email" className="text-primary" aria-hidden="true" />],
  ['anonymousVoting', <Fingerprint key="anonymous" className="text-primary" aria-hidden="true" />],
  ['oneVoterOneVote', <Vote key="vote" className="text-primary" aria-hidden="true" />],
  ['blockchainVerification', <ShieldCheck key="blockchain" className="text-primary" aria-hidden="true" />],
  ['realTimeResults', <BarChart3 key="results" className="text-primary" aria-hidden="true" />],
  ['fraudDetection', <CheckCircle2 key="fraud" className="text-primary" aria-hidden="true" />],
];

const stepKeys = ['processRegister', 'processVerify', 'processApproval', 'processElection', 'processVote', 'processReceipt'];

export default function HomePage() {
  const { language, t } = useLanguage();
  const [liveElections, setLiveElections] = useState([]);

  useEffect(() => {
    let active = true;
    listPublicElectionDashboard().then((rows) => {
      if (active) setLiveElections(rows);
    });
    const timer = setInterval(() => {
      listPublicElectionDashboard().then((rows) => {
        if (active) setLiveElections(rows);
      });
    }, 30000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const firstElection = liveElections[0];
  const labelMap = {
    'Department Club Election': t('departmentClubElection'),
    'Student Council Election 2026': t('studentCouncilElection'),
    'Library Committee Poll': t('libraryCommitteePoll'),
    'North Region': t('northRegion'),
    'South Region': t('southRegion'),
    'Central Region': t('centralRegion'),
    'Candidate C': t('candidateC'),
    'Candidate D': t('candidateD'),
    'Candidate E': t('candidateE'),
  };
  const localize = (value) => (language === 'bn' ? labelMap[value] ?? value : value);
  const localizedCandidates = (firstElection?.candidates ?? []).map((candidate) => ({
    ...candidate,
    localized_name: localize(candidate.candidate_name),
  }));

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="animated-grid absolute inset-0 opacity-80" aria-hidden="true" />
        <div className="container-page relative grid gap-8 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">{t('portalEyebrow')}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight text-text sm:text-5xl">
              {t('projectTitle')}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              {t('heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-[#16834A] px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5" to="/voter">
                <Vote size={18} aria-hidden="true" />
                {t('viewElections')}
              </Link>
              <Link className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary bg-white/80 px-6 py-3 text-sm font-bold text-primary shadow-soft transition hover:-translate-y-0.5 hover:bg-primary-light" to="/how-it-works">
                <ShieldCheck size={18} aria-hidden="true" />
                {t('howVotingWorks')}
              </Link>
            </div>
          </div>

          <div className="glass-panel relative overflow-hidden rounded-xl p-5">
            <div className="shimmer-line absolute inset-x-0 top-0 h-1" aria-hidden="true" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary-dark">{t('liveElectionHub')}</p>
                <h2 className="mt-2 text-2xl font-extrabold text-text">{localize(firstElection?.title ?? 'Department Club Election')}</h2>
              </div>
              <StatusBadge status={firstElection?.status ?? 'active'} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/70 bg-white/70 p-3">
                <p className="text-xs font-semibold uppercase text-muted">{t('totalVotes')}</p>
                <p className="mt-1 text-2xl font-extrabold text-text">{firstElection?.total_votes ?? 0}</p>
              </div>
              <div className="rounded-lg border border-white/70 bg-white/70 p-3">
                <p className="text-xs font-semibold uppercase text-muted">{t('leading')}</p>
                <p className="mt-1 truncate text-base font-extrabold text-primary">{localize(firstElection?.leader_name ?? 'Waiting')}</p>
              </div>
              <div className="rounded-lg border border-white/70 bg-white/70 p-3">
                <p className="text-xs font-semibold uppercase text-muted">{t('timeLeft')}</p>
                <p className="mt-1 text-2xl font-extrabold text-text">{firstElection?.time_left ?? '--'}</p>
              </div>
            </div>
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={localizedCandidates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D8E0DD" />
                  <XAxis dataKey="localized_name" tick={{ fontSize: 11 }} interval={0} height={52} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="vote_count" fill="#006A4E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <PageHeader title={t('liveElectionHub')} description={t('liveElectionDescription')} />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {liveElections.map((election) => (
            <article key={election.election_id} className="card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={election.status} />
                    <span className="rounded bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-info">{localize(election.region_name)}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-extrabold text-text">{localize(election.title)}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase text-muted">{t('totalVotes')}</p>
                  <p className="text-3xl font-extrabold text-primary">{election.total_votes}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-primary-light p-3">
                  <Trophy size={18} className="text-primary" aria-hidden="true" />
                  <p className="mt-2 text-xs font-semibold uppercase text-muted">{t('leading')}</p>
                  <p className="font-bold text-text">{localize(election.leader_name)}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <Timer size={18} className="text-primary" aria-hidden="true" />
                  <p className="mt-2 text-xs font-semibold uppercase text-muted">{t('timeLeft')}</p>
                  <p className="font-bold text-text">{election.time_left}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <Vote size={18} className="text-primary" aria-hidden="true" />
                  <p className="mt-2 text-xs font-semibold uppercase text-muted">{t('seat')}</p>
                  <p className="font-bold text-text">{localize(election.region_name)}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {election.candidates.map((candidate) => (
                  <div key={candidate.candidate_id}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-text">{localize(candidate.candidate_name)}</span>
                      <span className="font-bold text-primary">{candidate.vote_count} {t('votes')}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-primary-light">
                      <div className="h-2 rounded-full bg-gradient-to-r from-primary to-[#20A06F]" style={{ width: `${candidate.percentage ?? 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <div className="rounded-xl border border-[#ffb3b1] bg-[#fff7f7]/80 p-5 shadow-soft backdrop-blur">
          <h2 className="font-bold text-text">{t('importantNotice')}</h2>
          <p className="mt-2 text-muted">{t('noticeText')}</p>
        </div>
      </section>

      <section className="container-page pb-12">
        <PageHeader title={t('coreFeatures')} description={t('coreFeaturesDescription')} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map(([key, icon]) => (
            <article key={key} className="card group p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light transition group-hover:bg-primary group-hover:text-white">
                {icon}
              </div>
              <h3 className="mt-4 font-bold text-text">{t(key)}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/70 bg-white/50 py-12 backdrop-blur">
        <div className="container-page">
          <h2 className="text-2xl font-bold text-text">{t('votingProcess')}</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {stepKeys.map((step, index) => (
              <div key={step} className="card flex items-center gap-4 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#20A06F] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="font-semibold text-text">{t(step)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-6 py-12 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-text">{t('securityAssurance')}</h2>
          <p className="mt-3 text-muted">{t('securityAssuranceText')}</p>
        </div>
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-text">{t('publicInfo')}</h2>
          <p className="mt-3 text-muted">{t('publicInfoText')}</p>
        </div>
      </section>
    </>
  );
}
