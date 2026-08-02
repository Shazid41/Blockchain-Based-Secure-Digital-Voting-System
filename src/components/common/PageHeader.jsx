export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="surface-band relative overflow-hidden">
      <div className="animated-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="container-page py-6 sm:py-9 lg:py-10">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p> : null}
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-4xl text-2xl font-extrabold leading-tight text-text sm:text-4xl">{title}</h1>
            {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:mt-3 sm:text-base sm:leading-7">{description}</p> : null}
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}
