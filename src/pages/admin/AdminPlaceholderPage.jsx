import PageHeader from '../../components/common/PageHeader.jsx';

export default function AdminPlaceholderPage({ title, description }) {
  return (
    <>
      <PageHeader eyebrow="Admin" title={title} description={description} />
      <section className="container-page py-8">
        <div className="card p-6">
          <p className="text-muted">
            This page layout is prepared in Step 2. Live data, fraud logging, blockchain audit execution, and result
            aggregation are completed in Step 3 and later phases.
          </p>
        </div>
      </section>
    </>
  );
}
