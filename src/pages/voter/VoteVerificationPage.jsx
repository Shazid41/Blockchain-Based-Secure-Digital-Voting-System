import { useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import { verifyVoteReceipt } from '../../services/verificationService.js';

export default function VoteVerificationPage() {
  const [receipt, setReceipt] = useState('');
  const [result, setResult] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setResult(await verifyVoteReceipt(receipt));
  }

  return (
    <>
      <PageHeader eyebrow="Verification" title="Verify Vote Receipt" description="Check whether a receipt exists and is included in the tamper-evident ledger without exposing voter identity or candidate choice." />
      <section className="container-page py-8">
        <form className="card mx-auto max-w-2xl space-y-5 p-6" onSubmit={submit}>
          <FormInput id="receiptHash" label="Receipt hash" value={receipt} onChange={(event) => setReceipt(event.target.value)} placeholder="Paste receipt hash" />
          <PrimaryButton type="submit">Check receipt</PrimaryButton>
          {result ? (
            <AlertMessage type={result.receipt_found ? 'success' : 'warning'}>
              {result.receipt_found
                ? `Receipt found for ${result.election_name}. Block ${result.block_index}. Inclusion: ${result.inclusion_status}. Chain status: ${result.chain_status}. Verified at ${new Date(result.verification_time).toLocaleString()}.`
                : 'Receipt was not found.'}
            </AlertMessage>
          ) : null}
        </form>
      </section>
    </>
  );
}
