export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="border-b border-white/70 bg-white/45 backdrop-blur">
      <div className="container-page py-10">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p> : null}
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-text sm:text-4xl">{title}</h1>
            {description ? <p className="mt-3 max-w-3xl text-base leading-7 text-muted">{description}</p> : null}
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}
