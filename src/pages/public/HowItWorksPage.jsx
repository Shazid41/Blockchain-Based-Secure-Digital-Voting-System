import PageHeader from '../../components/common/PageHeader.jsx';

const steps = [
  'Create an account using full name, email, password, voter number, phone, date of birth, and region.',
  'Verify the email address through Supabase Auth.',
  'Wait for admin approval before voting access is enabled.',
  'Open an active election that matches the voter region.',
  'Select a candidate and confirm the vote.',
  'The database stores an anonymous ballot and creates a linked vote block.',
  'The voter receives a receipt hash for later verification.',
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Process"
        title="How the voting workflow works"
        description="The process is intentionally simple for voters while keeping the important security checks on the server side."
      />
      <section className="container-page py-10">
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step} className="card flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="text-muted">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
