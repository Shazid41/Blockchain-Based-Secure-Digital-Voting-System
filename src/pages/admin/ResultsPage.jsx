import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../../components/common/PageHeader.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import { demoElections } from '../../services/demoData.js';
import { getElectionResults, getRegionTurnout } from '../../services/resultService.js';

const colors = ['#006A4E', '#2563A6', '#D58A00', '#F42A41'];

export default function ResultsPage() {
  const [electionId, setElectionId] = useState('e2');
  const [rows, setRows] = useState([]);
  useEffect(() => { getElectionResults(electionId).then(setRows); }, [electionId]);
  const totalVotes = rows[0]?.total_votes ?? 0;
  const eligible = rows[0]?.total_eligible_voters ?? 0;
  const turnout = rows[0]?.turnout_percentage ?? 0;
  const leader = useMemo(() => [...rows].sort((a, b) => b.vote_count - a.vote_count)[0]?.candidate_name ?? 'No votes yet', [rows]);
  const regionTurnout = getRegionTurnout();

  return (
    <>
      <PageHeader eyebrow="Admin" title="Results" description="Aggregate-only election results. Individual ballots are not exposed." />
      <section className="container-page space-y-6 py-8">
        <div className="card max-w-md p-5">
          <SelectInput id="resultElection" label="Election" value={electionId} onChange={(e) => setElectionId(e.target.value)} options={demoElections.map((election) => ({ id: election.id, name: election.title }))} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Total Votes" value={totalVotes} />
          <SummaryCard title="Eligible Voters" value={eligible} />
          <SummaryCard title="Turnout" value={`${turnout}%`} />
          <SummaryCard title="Leading Candidate" value={leader} note={`Last updated: ${rows[0]?.last_update_time ? new Date(rows[0].last_update_time).toLocaleString() : 'No update'}`} />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="card h-80 p-5"><h2 className="mb-4 font-bold text-text">Candidate Vote Bar Chart</h2><ResponsiveContainer><BarChart data={rows}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="candidate_name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="vote_count" fill="#006A4E" /></BarChart></ResponsiveContainer></div>
          <div className="card h-80 p-5"><h2 className="mb-4 font-bold text-text">Vote Share Pie Chart</h2><ResponsiveContainer><PieChart><Pie data={rows} dataKey="vote_count" nameKey="candidate_name" outerRadius={90}>{rows.map((row, index) => <Cell key={row.candidate_id} fill={colors[index % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
          <div className="card h-80 p-5"><h2 className="mb-4 font-bold text-text">Region Turnout Chart</h2><ResponsiveContainer><BarChart data={regionTurnout}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="region" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="voted" fill="#2563A6" /><Bar dataKey="eligible" fill="#D58A00" /></BarChart></ResponsiveContainer></div>
          <div className="card overflow-x-auto p-5"><h2 className="mb-4 font-bold text-text">Candidate Result Table</h2><table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="py-2">Candidate</th><th>Votes</th><th>Percentage</th></tr></thead><tbody>{rows.map((row) => <tr key={row.candidate_id} className="border-b border-border"><td className="py-2">{row.candidate_name}</td><td>{row.vote_count}</td><td>{row.percentage}%</td></tr>)}</tbody></table></div>
        </div>
      </section>
    </>
  );
}
