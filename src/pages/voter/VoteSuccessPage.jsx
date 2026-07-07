import { Download, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import { demoReceipt } from '../../services/demoData.js';

export default function VoteSuccessPage() {
  const { state } = useLocation();
  const receipt = state?.receipt ?? {
    election_title: demoReceipt.electionName,
    cast_at: demoReceipt.castAt,
    receipt_hash: demoReceipt.receiptHash,
    block_index: demoReceipt.blockIndex,
    current_block_hash: demoReceipt.currentBlockHash,
  };

  function downloadReceipt() {
    const lines = [
      'Secure Digital Voting System - Vote Receipt',
      `Election: ${receipt.election_title}`,
      `Cast at: ${receipt.cast_at}`,
      `Receipt hash: ${receipt.receipt_hash}`,
      `Block index: ${receipt.block_index}`,
      `Current block hash: ${receipt.current_block_hash}`,
      'No voter identity or public candidate selection is included in this receipt.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vote-receipt.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader eyebrow="Vote Submitted" title="Your vote was recorded securely" description="Save this receipt hash. It can verify inclusion without revealing voter identity or candidate choice." />
      <section className="container-page py-8">
        <div className="card mx-auto max-w-3xl space-y-5 p-6">
          <AlertMessage type="success" title="Success status">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={18} /> Vote included in the tamper-evident ledger.</span>
          </AlertMessage>
          <dl className="grid gap-4 md:grid-cols-2">
            <div><dt className="font-semibold text-muted">Election</dt><dd className="font-bold text-text">{receipt.election_title}</dd></div>
            <div><dt className="font-semibold text-muted">Voting timestamp</dt><dd>{new Date(receipt.cast_at).toLocaleString()}</dd></div>
            <div className="md:col-span-2"><dt className="font-semibold text-muted">Receipt hash</dt><dd className="break-all font-mono text-sm">{receipt.receipt_hash}</dd></div>
            <div><dt className="font-semibold text-muted">Block index</dt><dd>{receipt.block_index}</dd></div>
            <div className="md:col-span-2"><dt className="font-semibold text-muted">Current block hash</dt><dd className="break-all font-mono text-sm">{receipt.current_block_hash}</dd></div>
          </dl>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryButton><Link to={`/voter/verify?receipt=${encodeURIComponent(receipt.receipt_hash)}`}>Verify Vote</Link></PrimaryButton>
            <SecondaryButton onClick={downloadReceipt}><Download size={18} /> Download Receipt</SecondaryButton>
          </div>
        </div>
      </section>
    </>
  );
}
