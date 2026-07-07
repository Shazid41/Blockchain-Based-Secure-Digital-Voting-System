export default function SummaryCard({ title, value, note, icon }) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">{title}</p>
          <p className="mt-2 text-3xl font-bold text-text">{value}</p>
        </div>
        {icon ? <div className="rounded bg-primary-light p-2 text-primary">{icon}</div> : null}
      </div>
      {note ? <p className="mt-3 text-sm text-muted">{note}</p> : null}
    </article>
  );
}
