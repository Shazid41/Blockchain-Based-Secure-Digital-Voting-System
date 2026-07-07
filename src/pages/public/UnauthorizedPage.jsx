import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';

export default function UnauthorizedPage() {
  return (
    <section>
      <PageHeader title="Permission denied" description="Your account does not have permission to open this page." />
      <div className="container-page flex gap-3 py-10">
        <PrimaryButton>
          <Link to="/voter">Return to dashboard</Link>
        </PrimaryButton>
        <SecondaryButton>
          <Link to="/">Return home</Link>
        </SecondaryButton>
      </div>
    </section>
  );
}
