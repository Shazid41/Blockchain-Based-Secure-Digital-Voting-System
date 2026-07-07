import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" description="The page address may be incorrect or the page may have moved." />
      <div className="container-page py-10">
        <PrimaryButton>
          <Link to="/">Return home</Link>
        </PrimaryButton>
      </div>
    </>
  );
}
