import { useEffect, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import useAuth from '../../hooks/useAuth.js';
import { listRegions } from '../../services/regionService.js';
import { getCurrentProfile, updateCurrentProfile } from '../../services/profileService.js';

export default function VoterProfilePage() {
  const { user } = useAuth();
  const [regions, setRegions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([listRegions(), getCurrentProfile(user?.id)]).then(([regionRows, profileRow]) => {
      setRegions(regionRows);
      setProfile(profileRow);
    });
  }, [user?.id]);

  if (!profile) return <PageHeader title="Profile" description="Loading profile..." />;

  async function save(event) {
    event.preventDefault();
    const saved = await updateCurrentProfile(user?.id, profile);
    setProfile(saved);
    setMessage('Profile updated. Role and approval status were not changed.');
  }

  return (
    <>
      <PageHeader eyebrow="Voter" title="Profile" description="Only safe personal fields can be updated by voters." />
      <section className="container-page py-8">
        <form className="card mx-auto max-w-3xl space-y-5 p-6" onSubmit={save}>
          {message ? <AlertMessage type="success">{message}</AlertMessage> : null}
          <div className="grid gap-5 md:grid-cols-2">
            <FormInput id="profileName" label="Full name" value={profile.full_name ?? ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
            <FormInput id="profileEmail" label="Email" value={profile.email ?? ''} disabled />
            <FormInput id="profileVoter" label="Voter number" value={profile.voter_number ?? ''} disabled />
            <FormInput id="profilePhone" label="Phone" value={profile.phone ?? ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <FormInput id="profileDob" label="Date of birth" type="date" value={profile.date_of_birth ?? ''} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })} />
            <SelectInput id="profileRegion" label="Region" options={regions} value={profile.region_id ?? ''} onChange={(e) => setProfile({ ...profile, region_id: e.target.value })} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="card bg-page p-4"><p className="text-sm text-muted">Role</p><p className="font-bold text-text">{profile.role}</p></div>
            <div className="card bg-page p-4"><p className="text-sm text-muted">Approval Status</p><div className="mt-2"><StatusBadge status={profile.approval_status} /></div></div>
          </div>
          <PrimaryButton type="submit">Save allowed changes</PrimaryButton>
        </form>
      </section>
    </>
  );
}
