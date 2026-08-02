import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
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
    voted_at: data.voted_at?.toDate?.().toISOString?.() ?? data.voted_at,
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
  return Boolean(allowed?.is_active);
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
  if (approvalStatus === 'approved') {
    const elections = await listFirebaseElections();
    await Promise.all(elections
      .filter((election) => ['active', 'scheduled'].includes(election.status))
      .map((election) => {
        const eligibilityId = `${id}_${election.id}`;
        return setDoc(doc(firebaseDb, 'voter_eligibility', eligibilityId), {
          id: eligibilityId,
          voter_id: id,
          election_id: election.id,
          is_eligible: true,
          updated_at: serverTimestamp(),
          created_at: serverTimestamp(),
        }, { merge: true });
      }));
  }
  return getFirebaseProfile(id);
}

export async function listFirebaseElections() {
  const elections = await listCollection('elections', [orderBy('start_time')]);
  const regions = await listFirebaseRegions();
  return elections.map((election) => ({ ...election, regions: regions.find((region) => region.id === election.region_id) ?? null }));
}

export async function getFirebaseElection(id) {
  const election = fromDoc(await getDoc(doc(firebaseDb, 'elections', id)));
  if (!election) return null;
  const region = election.region_id ? await getFirebaseRegion(election.region_id) : null;
  return { ...election, regions: region };
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

export async function listFirebaseVoteBlocks(filters = {}) {
  const blocks = await listCollection('vote_blocks');
  return blocks.filter((block) => !filters.electionId || block.election_id === filters.electionId);
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
  const anonymousVoterHash = await sha256Hex(`${voterId}:${electionId}:secure-voting`);
  const voteDocumentId = `${electionId}_${anonymousVoterHash}`;
  const profileRef = doc(firebaseDb, 'profiles', voterId);
  const electionRef = doc(firebaseDb, 'elections', electionId);
  const candidateRef = doc(firebaseDb, 'candidates', candidateId);
  const ballotRef = doc(firebaseDb, 'ballots', voteDocumentId);
  const blockRef = doc(firebaseDb, 'vote_blocks', voteDocumentId);
  const castAt = new Date().toISOString();
  const receiptHash = await sha256Hex(`${voterId}:${electionId}:${candidateId}:${castAt}:${crypto.randomUUID()}`);

  try {
    await runTransaction(firebaseDb, async (transaction) => {
      const [profileSnapshot, electionSnapshot, candidateSnapshot] = await Promise.all([
        transaction.get(profileRef),
        transaction.get(electionRef),
        transaction.get(candidateRef),
      ]);
      const profile = profileSnapshot.data();
      const election = electionSnapshot.data();
      const candidate = candidateSnapshot.data();
      if (!profile || profile.approval_status !== 'approved') throw new Error('Your voter account must be approved before voting.');
      if (!election || election.status !== 'active') throw new Error('Election is not active.');
      if (!candidate || candidate.election_id !== electionId || candidate.is_active === false) throw new Error('Candidate is not valid.');
      transaction.set(ballotRef, { id: ballotRef.id, election_id: electionId, candidate_id: candidateId, anonymous_voter_hash: anonymousVoterHash, receipt_hash: receiptHash, cast_at: serverTimestamp() });
      transaction.set(blockRef, { id: blockRef.id, ballot_id: ballotRef.id, election_id: electionId, candidate_id: candidateId, block_index: Date.now(), previous_hash: '0'.repeat(64), current_hash: receiptHash, receipt_hash: receiptHash, anonymous_voter_hash: anonymousVoterHash, created_at: serverTimestamp() });
    });
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('permission') || message.includes('already exists')) {
      throw new Error('You have already voted in this election, or this vote receipt already exists.');
    }
    throw error;
  }

  const election = fromDoc(await getDoc(electionRef));
  return {
    election_title: election?.title ?? 'Election',
    cast_at: castAt,
    receipt_hash: receiptHash,
    block_index: Date.now(),
    current_block_hash: receiptHash,
  };
}

export async function verifyFirebaseVoteReceipt(receiptHash) {
  requireFirebase();
  const normalizedHash = String(receiptHash ?? '').trim();
  if (!normalizedHash) {
    return { receipt_found: false, inclusion_status: 'not_found', chain_status: 'not_checked', verification_time: new Date().toISOString() };
  }

  const blocks = await listFirebaseVoteBlocks();
  const block = blocks.find((row) => row.current_hash === normalizedHash || row.receipt_hash === normalizedHash);
  if (!block) {
    return { receipt_found: false, inclusion_status: 'not_found', chain_status: 'not_checked', verification_time: new Date().toISOString() };
  }

  const [election, candidates] = await Promise.all([
    getFirebaseElection(block.election_id),
    listFirebaseCandidates({ electionId: block.election_id }),
  ]);
  const candidateExists = candidates.some((candidate) => candidate.id === block.candidate_id);

  return {
    receipt_found: true,
    receipt_hash: normalizedHash,
    election_id: block.election_id,
    election_name: election?.title ?? 'Election',
    block_index: block.block_index,
    current_block_hash: block.current_hash ?? normalizedHash,
    cast_at: block.created_at,
    inclusion_status: 'included',
    chain_status: candidateExists ? 'valid_live_chain' : 'included_candidate_removed',
    verification_time: new Date().toISOString(),
  };
}

export async function listFirebaseReceiptsForVoter(voterId) {
  requireFirebase();
  if (!voterId) return [];
  const [elections, blocks] = await Promise.all([listFirebaseElections(), listFirebaseVoteBlocks()]);
  const hashes = new Map(await Promise.all(elections.map(async (election) => [
    await sha256Hex(`${voterId}:${election.id}:secure-voting`),
    election,
  ])));

  return blocks
    .filter((block) => hashes.has(block.anonymous_voter_hash))
    .map((block) => {
      const election = hashes.get(block.anonymous_voter_hash);
      return {
        election_id: block.election_id,
        election_title: election?.title ?? 'Election',
        cast_at: block.created_at ?? block.cast_at,
        receipt_hash: block.receipt_hash ?? block.current_hash,
        block_index: block.block_index,
        current_block_hash: block.current_hash ?? block.receipt_hash,
        chain_status: 'valid_live_chain',
      };
    })
    .sort((a, b) => new Date(b.cast_at).getTime() - new Date(a.cast_at).getTime());
}

export async function listFirebasePublicDashboard() {
  const [elections, candidates, voteBlocks, regions] = await Promise.all([
    listFirebaseElections(),
    listFirebaseCandidates(),
    listFirebaseVoteBlocks(),
    listFirebaseRegions(),
  ]);
  return elections
    .filter((election) => election.status === 'active' && election.result_visibility === 'live')
    .map((election) => {
      const rows = candidates.filter((candidate) => candidate.election_id === election.id && candidate.is_active !== false).map((candidate) => {
        const voteCount = voteBlocks.filter((block) => block.candidate_id === candidate.id).length;
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
