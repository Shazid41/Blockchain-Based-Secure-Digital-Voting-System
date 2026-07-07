import { UserRound } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';

export default function CandidateCard({ candidate }) {
  return (
    <article className="card p-5">
      <div className="flex gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-border bg-primary-light text-primary">
          <UserRound aria-hidden="true" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-text">{candidate.full_name}</h3>
            <StatusBadge status={candidate.is_active ? 'active' : 'suspended'} />
          </div>
          <p className="text-sm font-semibold text-primary">{candidate.party_name || 'Independent'}</p>
          <p className="mt-2 text-sm text-muted">{candidate.biography}</p>
          <p className="mt-2 text-xs text-muted">Symbol: {candidate.symbol_url || 'Image placeholder'}</p>
        </div>
      </div>
    </article>
  );
}
