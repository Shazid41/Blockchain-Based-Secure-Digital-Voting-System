import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No records found', message }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-10 text-center">
      <Inbox className="mb-3 text-primary" size={36} aria-hidden="true" />
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      {message ? <p className="mt-2 max-w-md text-muted">{message}</p> : null}
    </div>
  );
}
