import { Copy, Download } from 'lucide-react';
import { useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { auditReportText, listVoteBlocks, verifyElectionChain } from '../../services/blockchainService.js';
import { demoElections } from '../../services/demoData.js';

function shortHash(hash = '') {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export default function BlockchainAuditPage() {
  const [electionId, setElectionId] = useState('e2');
  const [result, setResult] = useState(null);
  const [blocks, setBlocks] = useState([]);

  async function runAudit() {
    const [auditResult, voteBlocks] = await Promise.all([verifyElectionChain(electionId), listVoteBlocks(electionId)]);
    setResult(auditResult);
    setBlocks(voteBlocks);
  }

  function exportReport() {
    const blob = new Blob([auditReportText(electionId, result, blocks)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit-report.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Blockchain Audit" description="Verify the blockchain-inspired tamper-evident vote ledger for an election." />
      <section className="container-page space-y-6 py-8">
        <div className="card flex flex-col gap-4 p-5 md:flex-row md:items-end">
          <SelectInput id="auditElection" label="Election" value={electionId} onChange={(e) => setElectionId(e.target.value)} options={demoElections.map((election) => ({ id: election.id, name: election.title }))} />
          <PrimaryButton onClick={runAudit}>Run Verification</PrimaryButton>
          <SecondaryButton onClick={exportReport} disabled={!result}><Download size={18} /> Export Audit Report</SecondaryButton>
        </div>
        {result ? <AlertMessage type={result.is_valid ? 'success' : 'error'} title={result.is_valid ? 'Valid chain' : 'Invalid chain'}>{result.message} Error type: {result.error_type}. Last verification: {new Date(result.verified_at).toLocaleString()}.</AlertMessage> : null}
        {result ? <div className="grid gap-4 md:grid-cols-4"><div className="card p-4"><p className="text-sm text-muted">Total blocks</p><p className="text-2xl font-bold">{result.total_blocks}</p></div><div className="card p-4"><p className="text-sm text-muted">Verified blocks</p><p className="text-2xl font-bold">{result.verified_blocks}</p></div><div className="card p-4"><p className="text-sm text-muted">First invalid</p><p className="text-2xl font-bold">{result.first_invalid_block ?? 'None'}</p></div><div className="card p-4"><p className="text-sm text-muted">Status</p><StatusBadge status={result.is_valid ? 'verified' : 'suspended'} /></div></div> : null}
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-primary-light text-primary-dark"><tr><th className="p-3">Block index</th><th>Previous hash</th><th>Current hash</th><th>Created</th><th>Status</th><th>Copy</th></tr></thead>
            <tbody>{blocks.map((block) => <tr key={block.id} className="border-t border-border"><td className="p-3">{block.block_index}</td><td className="font-mono">{shortHash(block.previous_hash)}</td><td className="font-mono">{shortHash(block.current_hash)}</td><td>{new Date(block.created_at).toLocaleString()}</td><td><StatusBadge status={result?.is_valid ? 'verified' : 'warning'} /></td><td><button className="focus-ring rounded p-2 text-primary" onClick={() => navigator.clipboard?.writeText(block.current_hash)} aria-label="Copy hash"><Copy size={16} /></button></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}
