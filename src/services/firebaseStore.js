import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { sha256Hex } from '../utils/blockchain.js';
import { demoApprovedNids } from './approvedNids.js';
import { firebaseDb, isFirebaseConfigured } from './firebaseClient.js';

const ADMIN_EMAIL = 'shazidsaharia21@gmail.com';

function requireFirebase() {
  if (!isFirebaseConfigured || !firebaseDb) throw new Error('Firebase is not configured.');
}

function clean(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

function fromDoc(snapshot) {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    created_at: data.created_at?.toDate?.().toISOString?.() ?? data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at?.toDate?.().toISOString?.() ?? data.updated_at,
    start_time: data.start_time?.toDate?.().toISOString?.() ?? data.start_time,
    end_time: data.end_time?.toDate?.().toISOString?.() ?? data.end_time,
    cast_at: data.cast_at?.toDate?.().toISOString?.() ?? data.cast_at,
  };
}

async function listCollection(name, constraints = []) {
  requireFirebase();
  const snapshots = await getDocs(query(collection(firebaseDb, name), ...constraints));
  return snapshots.docs.map(fromDoc);
}

export async function ensureFirebaseSeed() {
  requireFirebase();
  const defaultRegions = [
    { id: 'north', name: 'North Region', code: 'NORTH', description: 'Northern voting region.' },
    { id: 'south', name: 'South Region', code: 'SOUTH', description: 'Southern voting region.' },
    { id: 'central', name: 'Central Region', code: 'CENTRAL', description: 'Central voting region.' },
  ];
  const defaultElection = {
    id: 'e-live-1',
    title: 'National Digital Election 2026',
    description: 'Live secure digital voting election.',
    start_time: '2026-07-29T00:00:00.000Z',
    end_time: '2026-08-15T18:00:00.000Z',
    status: 'active',
    region_id: 'north',
    result_visibility: 'live',
  };
  const defaultCandidates = [
    {
      id: 'c-live-1',
      election_id: defaultElection.id,
      full_name: 'Ayesha Rahman',
      party_name: 'Progress Alliance',
      biography: 'Focused on transparent digital governance.',
      region_id: 'north',
      symbol_url: '',
      is_active: true,
    },
    {
      id: 'c-live-2',
      election_id: defaultElection.id,
      full_name: 'Rafiq Hasan',
      party_name: 'Citizen Unity',
      biography: 'Focused on public access and accountability.',
      region_id: 'north',
      symbol_url: '',
      is_active: true,
    },
    {
      id: 'c-live-3',
      election_id: defaultElection.id,
      full_name: 'Nusrat Karim',
      party_name: 'Digital Reform',
      biography: 'Focused on secure civic technology.',
      region_id: 'north',
      symbol_url: '',
      is_active: true,
    },
  ];

  await Promise.all([
    ...defaultRegions.map((region) => setDoc(doc(firebaseDb, 'regions', region.id), { ...region, created_at: serverTimestamp() }, { merge: true })),
    ...demoApprovedNids.map((row) => setDoc(doc(firebaseDb, 'approved_nids', row.nid), { ...row, created_at: serverTimestamp() }, { merge: true })),
    setDoc(doc(firebaseDb, 'elections', defaultElection.id), { ...defaultElection, created_at: serverTimestamp(), updated_at: serverTimestamp() }, { merge: true }),
    ...defaultCandidates.map((candidate) => setDoc(doc(firebaseDb, 'candidates', candidate.id), { ...candidate, created_at: serverTimestamp(), updated_at: serverTimestamp() }, { merge: true })),
  ]);
}

export async function upsertFirebaseProfile(user, fields = {}) {
  requireFirebase();
  const email = user.email ?? fields.email ?? '';
  const admin = email.toLowerCase() === ADMIN_EMAIL;
  const profile = clean({
    id: user.uid,
    full_name: admin ? 'Md. Shazidur Rahaman' : fields.fullName,
    email,
    voter_number: admin ? '0000000000000000' : fields.voterNumber,
    phone: fields.phone ?? '',
    date_of_birth: fields.dateOfBirth ?? '',
    region_id: fields.regionId ?? '',
    role: admin ? 'admin' : 'voter',
    approval_status: admin ? 'approved' : 'pending',
    updated_at: serverTimestamp(),
  });

  await setDoc(doc(firebaseDb, 'profiles', user.uid), { ...profile, created_at: serverTimestamp() }, { merge: true });
  return getFirebaseProfile(user.uid);
}

export async function getFirebaseProfile(userId) {
  requireFirebase();
  const snapshot = await getDoc(doc(firebaseDb, 'profiles', userId));
  return fromDoc(snapshot);
}

export async function updateFirebaseProfile(userId, updates) {
  requireFirebase();
  const safeUpdates = clean({ ...updates, updated_at: serverTimestamp() });
  await updateDoc(doc(firebaseDb, 'profiles', userId), safeUpdates);
  return getFirebaseProfile(userId);
}

export async function listFirebaseRegions() {
  return listCollection('regions', [orderBy('name')]);
}

export async function saveFirebaseRegion(region) {
  requireFirebase();
  const id = region.id || crypto.randomUUID();
  const payload = clean({ ...region, id, updated_at: serverTimestamp(), created_at: region.created_at ?? serverTimestamp() });
  await setDoc(doc(firebaseDb, 'regions', id), payload, { merge: true });
  return getFirebaseRegion(id);
}

export async function getFirebaseRegion(id) {
  requireFirebase();
  return fromDoc(await getDoc(doc(firebaseDb, 'regions', id)));
}

export async function deleteFirebaseRegion(id) {
  requireFirebase();
  await deleteDoc(doc(firebaseDb, 'regions', id));
  return id;
}

export async function listFirebaseApprovedNids() {
  return listCollection('approved_nids', [orderBy('created_at', 'desc')]);
}

export async function saveFirebaseApprovedNid(row) {
  requireFirebase();
  const payload = clean({ ...row, is_active: row.is_active ?? true, created_at: serverTimestamp() });
  await setDoc(doc(firebaseDb, 'approved_nids', row.nid), payload, { merge: true });
  return fromDoc(await getDoc(doc(firebaseDb, 'approved_nids', row.nid)));
}

export async function updateFirebaseApprovedNid(nid, updates) {
  requireFirebase();
  await updateDoc(doc(firebaseDb, 'approved_nids', nid), updates);
  return fromDoc(await getDoc(doc(firebaseDb, 'approved_nids', nid)));
}

export async function isFirebaseNidAvailable(nid) {
  requireFirebase();
  const allowed = fromDoc(await getDoc(doc(firebaseDb, 'approved_nids', nid)));
  if (!allowed?.is_active) return false;
  const profiles = await listCollection('profiles', [where('voter_number', '==', nid), limit(1)]);
  return profiles.length === 0;
}

export async function listFirebaseVoters() {
  const profiles = await listCollection('profiles');
  return profiles
    .filter((profile) => profile.role === 'voter')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateFirebaseVoterStatus(id, approvalStatus) {
  requireFirebase();
  await updateDoc(doc(firebaseDb, 'profiles', id), { approval_status: approvalStatus, updated_at: serverTimestamp() });
  return getFirebaseProfile(id);
}

export async function listFirebaseElections() {
  const elections = await listCollection('elections', [orderBy('start_time')]);
  const regions = await listFirebaseRegions();
  return elections.map((election) => ({ ...election, regions: regions.find((region) => region.id === election.region_id) ?? null }));
}

export async function saveFirebaseElection(election) {
  requireFirebase();
  const id = election.id || crypto.randomUUID();
  const payload = clean({
    ...election,
    id,
    updated_at: serverTimestamp(),
    created_at: election.created_at ?? serverTimestamp(),
  });
  delete payload.regions;
  await setDoc(doc(firebaseDb, 'elections', id), payload, { merge: true });
  return (await listFirebaseElections()).find((row) => row.id === id);
}

export async function listFirebaseCandidates(filters = {}) {
  const candidates = await listCollection('candidates');
  return candidates
    .filter((candidate) => !filters.electionId || candidate.election_id === filters.electionId)
    .sort((a, b) => String(a.full_name ?? '').localeCompare(String(b.full_name ?? '')));
}

export async function listFirebaseBallots(filters = {}) {
  const ballots = await listCollection('ballots');
  return ballots.filter((ballot) => !filters.electionId || ballot.election_id === filters.electionId);
}

export async function saveFirebaseCandidate(candidate) {
  requireFirebase();
  const id = candidate.id || crypto.randomUUID();
  const payload = clean({ ...candidate, id, updated_at: serverTimestamp(), created_at: candidate.created_at ?? serverTimestamp() });
  delete payload.elections;
  delete payload.regions;
  await setDoc(doc(firebaseDb, 'candidates', id), payload, { merge: true });
  return fromDoc(await getDoc(doc(firebaseDb, 'candidates', id)));
}

export async function listFirebaseEligibilityForVoter(voterId) {
  return listCollection('voter_eligibility', [where('voter_id', '==', voterId)]);
}

export async function listFirebaseEligibility(filters = {}) {
  const rows = await listCollection('voter_eligibility');
  return rows.filter((row) => !filters.electionId || row.election_id === filters.electionId);
}

export async function setFirebaseEligibility(row) {
  requireFirebase();
  const id = row.id || `${row.voter_id}_${row.election_id}`;
  await setDoc(doc(firebaseDb, 'voter_eligibility', id), { ...row, id, updated_at: serverTimestamp(), created_at: row.created_at ?? serverTimestamp() }, { merge: true });
  return fromDoc(await getDoc(doc(firebaseDb, 'voter_eligibility', id)));
}

export async function castFirebaseVote({ voterId, electionId, candidateId }) {
  requireFirebase();
  const eligibilityId = `${voterId}_${electionId}`;
  const eligibilityRef = doc(firebaseDb, 'voter_eligibility', eligibilityId);
  const electionRef = doc(firebaseDb, 'elections', electionId);
  const candidateRef = doc(firebaseDb, 'candidates', candidateId);
  const ballotRef = doc(collection(firebaseDb, 'ballots'));
  const blockRef = doc(collection(firebaseDb, 'vote_blocks'));
  const castAt = new Date().toISOString();
  const receiptHash = await sha256Hex(`${voterId}:${electionId}:${candidateId}:${castAt}:${crypto.randomUUID()}`);

  await runTransaction(firebaseDb, async (transaction) => {
    const [eligibilitySnapshot, electionSnapshot, candidateSnapshot] = await Promise.all([
      transaction.get(eligibilityRef),
      transaction.get(electionRef),
      transaction.get(candidateRef),
    ]);
    const eligibility = eligibilitySnapshot.data();
    const election = electionSnapshot.data();
    const candidate = candidateSnapshot.data();
    if (!eligibility?.is_eligible) throw new Error('You are not eligible for this election.');
    if (eligibility.has_voted) throw new Error('You have already voted in this election.');
    if (!election || election.status !== 'active') throw new Error('Election is not active.');
    if (!candidate || candidate.election_id !== electionId || candidate.is_active === false) throw new Error('Candidate is not valid.');
    transaction.set(ballotRef, { id: ballotRef.id, election_id: electionId, candidate_id: candidateId, receipt_hash: receiptHash, cast_at: serverTimestamp() });
    transaction.set(blockRef, { id: blockRef.id, ballot_id: ballotRef.id, election_id: electionId, block_index: Date.now(), previous_hash: '0'.repeat(64), current_hash: receiptHash, created_at: serverTimestamp() });
    transaction.update(eligibilityRef, { has_voted: true, voted_at: serverTimestamp() });
  });

  const election = fromDoc(await getDoc(electionRef));
  return {
    election_title: election?.title ?? 'Election',
    cast_at: castAt,
    receipt_hash: receiptHash,
    block_index: Date.now(),
    current_block_hash: receiptHash,
  };
}

export async function listFirebasePublicDashboard() {
  const [elections, candidates, ballots, regions] = await Promise.all([
    listFirebaseElections(),
    listFirebaseCandidates(),
    listCollection('ballots'),
    listFirebaseRegions(),
  ]);
  return elections
    .filter((election) => election.status === 'active' && election.result_visibility === 'live')
    .map((election) => {
      const rows = candidates.filter((candidate) => candidate.election_id === election.id && candidate.is_active !== false).map((candidate) => {
        const voteCount = ballots.filter((ballot) => ballot.candidate_id === candidate.id).length;
        return { candidate_id: candidate.id, candidate_name: candidate.full_name, party_name: candidate.party_name, vote_count: voteCount };
      });
      const totalVotes = rows.reduce((sum, row) => sum + row.vote_count, 0);
      const leader = [...rows].sort((a, b) => b.vote_count - a.vote_count)[0];
      return {
        election_id: election.id,
        title: election.title,
        status: election.status,
        start_time: election.start_time,
        end_time: election.end_time,
        region_name: regions.find((region) => region.id === election.region_id)?.name ?? 'All Regions',
        total_votes: totalVotes,
        leader_name: leader?.candidate_name ?? 'No votes yet',
        leader_votes: leader?.vote_count ?? 0,
        candidates: rows.map((row) => ({ ...row, percentage: totalVotes ? Math.round((row.vote_count / totalVotes) * 100) : 0 })),
      };
    });
}
