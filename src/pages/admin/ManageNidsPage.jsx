import { useEffect, useMemo, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { createApprovedNid, listApprovedNids, updateApprovedNid } from '../../services/nidService.js';
import { isValidVoterNumber } from '../../utils/validation.js';

export default function ManageNidsPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ nid: '', note: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listApprovedNids()
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(
    () => rows.filter((row) => `${row.nid} ${row.note ?? ''}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search],
  );

  async function save(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    const nid = form.nid.trim();
    if (!isValidVoterNumber(nid)) {
      setError('NID must be exactly 10 or 16 digits.');
      return;
    }
    if (rows.some((row) => row.nid === nid)) {
      setError('This NID is already in the approved list.');
      return;
    }

    try {
      const created = await createApprovedNid({ nid, note: form.note.trim(), is_active: true });
      setRows((current) => [created, ...current]);
      setForm({ nid: '', note: '' });
      setNotice('NID added to the approved registration list.');
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function toggle(row) {
    setError('');
    setNotice('');
    try {
      const updated = await updateApprovedNid(row.nid, { is_active: !row.is_active });
      setRows((current) => current.map((item) => (item.nid === row.nid ? { ...item, ...updated } : item)));
      setNotice(updated.is_active ? 'NID activated.' : 'NID deactivated.');
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Approved NID List" description="Only active NID numbers from this list can create voter accounts." />
      <section className="container-page grid gap-6 py-8 xl:grid-cols-[380px_1fr]">
        <form className="card space-y-4 p-5" onSubmit={save}>
          {notice ? <AlertMessage type="success">{notice}</AlertMessage> : null}
          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
          <FormInput id="approvedNid" label="10 or 16 digit NID" value={form.nid} onChange={(event) => setForm({ ...form, nid: event.target.value.replace(/\D/g, '') })} />
          <FormInput id="nidNote" label="Note" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
          <PrimaryButton type="submit">Add NID</PrimaryButton>
        </form>

        <div className="space-y-4">
          <FormInput id="nidSearch" label="Search NID" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-primary-light text-primary-dark">
                <tr>
                  <th className="p-3">NID</th>
                  <th>Note</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.nid} className="border-t border-border">
                    <td className="p-3 font-semibold text-text">{row.nid}</td>
                    <td>{row.note || 'Allowed voter NID'}</td>
                    <td><StatusBadge status={row.is_active ? 'approved' : 'suspended'} /></td>
                    <td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Demo'}</td>
                    <td>
                      <SecondaryButton onClick={() => toggle(row)}>
                        {row.is_active ? 'Deactivate' : 'Activate'}
                      </SecondaryButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border p-3 text-sm text-muted">
              {loading ? 'Loading approved NIDs...' : `Showing ${visible.length} NID numbers.`}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
