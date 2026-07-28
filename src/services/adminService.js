import { demoCandidates, demoElections, demoRegions, demoVoters } from './demoData.js';
import { listLocalVoterProfiles } from './authService.js';
import { isFirebaseConfigured } from './firebaseClient.js';
import { listFirebaseCandidates, listFirebaseElections, listFirebaseRegions, listFirebaseVoters } from './firebaseStore.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function getAdminSummary() {
  if (isFirebaseConfigured) {
    const [voters, elections, candidates, regions] = await Promise.all([
      listFirebaseVoters(),
      listFirebaseElections(),
      listFirebaseCandidates(),
      listFirebaseRegions(),
    ]);
    return {
      totalVoters: voters.length,
      approvedVoters: voters.filter((voter) => voter.approval_status === 'approved').length,
      pendingVoters: voters.filter((voter) => voter.approval_status === 'pending').length,
      activeElections: elections.filter((election) => election.status === 'active').length,
      totalCandidates: candidates.length,
      totalRegions: regions.length,
      recentVoters: voters.slice(0, 5),
      upcomingElections: elections
        .filter((election) => !election.end_time || new Date(election.end_time).getTime() >= Date.now())
        .slice(0, 5),
    };
  }

  if (isSupabaseConfigured) {
    try {
      const [
        votersCount,
        approvedCount,
        pendingCount,
        activeElectionsCount,
        candidatesCount,
        regionsCount,
        recentVoters,
        upcomingElections,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'voter'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'voter').eq('approval_status', 'approved'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'voter').eq('approval_status', 'pending'),
        supabase.from('elections').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('regions').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id, full_name, email, voter_number, approval_status, created_at').eq('role', 'voter').order('created_at', { ascending: false }).limit(5),
        supabase.from('elections').select('id, title, status, start_time, regions(name)').gte('end_time', new Date().toISOString()).order('start_time', { ascending: true }).limit(5),
      ]);

      const firstError = [votersCount, approvedCount, pendingCount, activeElectionsCount, candidatesCount, regionsCount, recentVoters, upcomingElections].find((response) => response.error)?.error;
      if (firstError) throw firstError;

      return {
        totalVoters: votersCount.count ?? 0,
        approvedVoters: approvedCount.count ?? 0,
        pendingVoters: pendingCount.count ?? 0,
        activeElections: activeElectionsCount.count ?? 0,
        totalCandidates: candidatesCount.count ?? 0,
        totalRegions: regionsCount.count ?? 0,
        recentVoters: recentVoters.data ?? [],
        upcomingElections: upcomingElections.data ?? [],
      };
    } catch {
      // Fall through to local/demo summary when Supabase is paused.
    }
  }

  const localVoters = listLocalVoterProfiles();
  const voters = [...localVoters, ...demoVoters];
  const approved = voters.filter((voter) => voter.approval_status === 'approved').length;
  const pending = voters.filter((voter) => voter.approval_status === 'pending').length;
  return {
    totalVoters: voters.length,
    approvedVoters: approved,
    pendingVoters: pending,
    activeElections: demoElections.filter((election) => election.status === 'active').length,
    totalCandidates: demoCandidates.length,
    totalRegions: demoRegions.length,
    recentVoters: voters.slice(0, 5),
    upcomingElections: demoElections.slice(0, 5),
  };
}
