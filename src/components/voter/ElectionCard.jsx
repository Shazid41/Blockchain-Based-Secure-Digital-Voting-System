import { Link } from 'react-router-dom';
import PrimaryButton from '../common/PrimaryButton.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { regionName } from '../../services/demoData.js';

export default function ElectionCard({ election, eligibility }) {
  return (
    <article className="card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">{election.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{election.description}</p>
        </div>
        <StatusBadge status={election.status} />
      </div>
      <dl className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
        <div><dt className="font-semibold text-text">Region</dt><dd>{regionName(election.region_id)}</dd></div>
        <div><dt className="font-semibold text-text">Eligibility</dt><dd>{eligibility?.is_eligible ? 'Eligible' : 'Not eligible yet'}</dd></div>
        <div><dt className="font-semibold text-text">Start</dt><dd>{new Date(election.start_time).toLocaleString()}</dd></div>
        <div><dt className="font-semibold text-text">End</dt><dd>{new Date(election.end_time).toLocaleString()}</dd></div>
        <div><dt className="font-semibold text-text">Voting status</dt><dd>{eligibility?.has_voted ? 'Completed' : 'Not voted'}</dd></div>
      </dl>
      <div className="mt-5">
        <PrimaryButton>
          <Link to={`/voter/elections/${election.id}`}>View Details</Link>
        </PrimaryButton>
      </div>
    </article>
  );
}
