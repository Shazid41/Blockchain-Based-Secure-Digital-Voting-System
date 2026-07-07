import { useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    websiteTitle: 'Secure Digital Voting System',
    supportEmail: 'support@example.com',
    defaultLanguage: 'en',
    resultPreference: 'after_end',
    maintenanceNotice: '',
  });

  return (
    <>
      <PageHeader eyebrow="Admin" title="Settings" description="Project settings placeholders. Do not store secrets here." />
      <section className="container-page py-8">
        <form className="card mx-auto max-w-3xl space-y-5 p-6" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
          {saved ? <AlertMessage type="success">Settings saved in the current screen state. Persistent storage can be added later.</AlertMessage> : null}
          <FormInput id="websiteTitle" label="Website title" value={settings.websiteTitle} onChange={(e) => setSettings({ ...settings, websiteTitle: e.target.value })} />
          <FormInput id="supportEmail" label="Support email placeholder" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} />
          <SelectInput id="defaultLanguage" label="Default language" value={settings.defaultLanguage} onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })} options={[{ id: 'en', name: 'English' }, { id: 'bn', name: 'Bangla' }]} />
          <SelectInput id="resultPreference" label="Result display preference" value={settings.resultPreference} onChange={(e) => setSettings({ ...settings, resultPreference: e.target.value })} options={[{ id: 'hidden', name: 'Hidden' }, { id: 'live', name: 'Live' }, { id: 'after_end', name: 'After election end' }]} />
          <FormInput id="maintenanceNotice" label="Maintenance notice" value={settings.maintenanceNotice} onChange={(e) => setSettings({ ...settings, maintenanceNotice: e.target.value })} />
          <PrimaryButton type="submit">Save settings</PrimaryButton>
        </form>
      </section>
    </>
  );
}
