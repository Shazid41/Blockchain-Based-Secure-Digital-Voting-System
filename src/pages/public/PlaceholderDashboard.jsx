import PageHeader from '../../components/common/PageHeader.jsx';

export default function PlaceholderDashboard({ role }) {
  return (
    <>
      <PageHeader
        title={`${role} dashboard`}
        description="This protected placeholder confirms the Step 1 route structure. Full dashboard features will be built in later phases."
      />
      <section className="container-page py-10">
        <div className="card p-6">
          <p className="text-muted">Authentication, role checks, and approval-gated voting workflows continue in Step 2 and later phases.</p>
        </div>
      </section>
    </>
  );
}
