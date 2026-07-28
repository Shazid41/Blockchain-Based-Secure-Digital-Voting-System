import { useEffect, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import { createRegion, deleteRegion, listRegions, updateRegion } from '../../services/regionService.js';

const emptyRegion = { name: '', code: '', description: '' };

export default function ManageRegionsPage() {
  const [regions, setRegions] = useState([]);
  const [form, setForm] = useState(emptyRegion);
  const [editingId, setEditingId] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const visible = regions.filter((region) => `${region.name} ${region.code}`.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    listRegions().then(setRegions).catch((loadError) => setError(loadError.message));
  }, []);

  async function save(event) {
    event.preventDefault();
    setError('');
    if (!form.name || !form.code) return setError('Region name and code are required.');
    if (regions.some((region) => region.code === form.code && region.id !== editingId)) return setError('Region code must be unique.');
    try {
      const saved = editingId ? await updateRegion(editingId, form) : await createRegion(form);
      if (editingId) setRegions((rows) => rows.map((row) => row.id === editingId ? saved : row));
      else setRegions((rows) => [saved, ...rows]);
      setForm(emptyRegion);
      setEditingId('');
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function remove(region) {
    setError('');
    try {
      await deleteRegion(region.id);
      setRegions((rows) => rows.filter((row) => row.id !== region.id));
    } catch (deleteError) {
      setError(`Could not delete region. It may already be used by live voters/elections. ${deleteError.message}`);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Manage Regions" description="Create, edit, and safely manage election regions." />
      <section className="container-page grid gap-6 py-8 xl:grid-cols-[380px_1fr]">
        <form className="card space-y-4 p-5" onSubmit={save}>
          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
          <FormInput id="regionName" label="Region name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <FormInput id="regionCode" label="Region code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <FormInput id="regionDescription" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <PrimaryButton type="submit">{editingId ? 'Update region' : 'Add region'}</PrimaryButton>
        </form>
        <div className="space-y-4">
          <FormInput id="regionSearch" label="Search regions" value={search} onChange={(e) => setSearch(e.target.value)} />
          {visible.map((region) => <article key={region.id} className="card p-5"><h2 className="font-bold text-text">{region.name}</h2><p className="text-sm text-muted">{region.code} - {region.description}</p><div className="mt-3 flex gap-2"><SecondaryButton onClick={() => { setEditingId(region.id); setForm(region); }}>Edit</SecondaryButton><SecondaryButton onClick={() => remove(region)}>Delete</SecondaryButton></div></article>)}
        </div>
      </section>
    </>
  );
}
