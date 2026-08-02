import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import { verifyVoteReceipt } from '../../services/verificationService.js';

export default function VoteVerificationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialReceipt = searchParams.get('receipt') ?? '';
  const [receipt, setReceipt] = useState(initialReceipt);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  async function checkReceipt(nextReceipt = receipt) {
    const normalizedReceipt = String(nextReceipt ?? '').trim();
    if (!normalizedReceipt) return;
    setError('');
    setChecking(true);
    try {
      const nextResult = await verifyVoteReceipt(normalizedReceipt);
      setResult(nextResult);
      setSearchParams({ receipt: normalizedReceipt });
    } catch (verifyError) {
      setError(verifyError.message || 'Receipt could not be checked.');
      setResult(null);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (initialReceipt) checkReceipt(initialReceipt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(event) {
    event.preventDefault();
    checkReceipt();
  }

  return (
    <>
      <PageHeader eyebrow="Verification" title="Verify Vote Receipt" description="Check whether a receipt exists and is included in the tamper-evident ledger without exposing voter identity or candidate choice." />
      <section className="container-page py-8">
        <form className="card mx-auto max-w-2xl space-y-5 p-6" onSubmit={submit}>
          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
          <FormInput id="receiptHash" label="Receipt hash" value={receipt} onChange={(event) => setReceipt(event.target.value)} placeholder="Paste receipt hash" />
          <PrimaryButton type="submit" disabled={checking || !receipt.trim()}>{checking ? 'Checking...' : 'Check receipt'}</PrimaryButton>
          {result ? (
            <AlertMessage type={result.receipt_found ? 'success' : 'warning'}>
              {result.receipt_found ? (
                <span className="block space-y-1">
                  <span className="block font-bold">Receipt found for {result.election_name}.</span>
                  <span className="block">Block {result.block_index}. Inclusion: {result.inclusion_status}. Chain status: {result.chain_status}.</span>
                  <span className="block break-all font-mono text-xs">Hash: {result.receipt_hash}</span>
                  <span className="block">Verified at {new Date(result.verification_time).toLocaleString()}.</span>
                </span>
              ) : 'Receipt was not found.'}
            </AlertMessage>
          ) : null}
        </form>
      </section>
    </>
  );
}
