# Viva Questions

## Week 3

### Juli
1. Why should form labels always be visible?  
Answer: They improve accessibility and reduce confusion.
2. What is the purpose of a status badge?  
Answer: It summarizes state such as pending or approved.

### Jarin
1. What should be tested in a registration form?  
Answer: Required fields, invalid email, weak password, and duplicate identity.
2. Why test responsive pages?  
Answer: Voters may use mobile, tablet, or desktop devices.

### Shanzita
1. Why is an ER diagram useful?  
Answer: It explains database relationships clearly.
2. Why include limitations?  
Answer: It prevents overclaiming project security.

### Shazidur
1. Why should voters not choose their own role?  
Answer: It would allow privilege escalation.
2. Why is RLS needed?  
Answer: It enforces access rules at the database layer.
3. Why should `voter_id + election_id` be unique?  
Answer: It prevents duplicate eligibility rows.
4. Why keep Supabase calls in services?  
Answer: Pages stay cleaner and business logic is easier to reuse.

## Week 4

### Juli
1. What is the role of dashboard navigation?  
Answer: It helps users find core actions quickly.

### Jarin
1. What should an unauthorized route test verify?  
Answer: Voters cannot access admin pages.

### Shanzita
1. What should an admin manual explain?  
Answer: Voter approval, region, election, and candidate workflows.

### Shazidur
1. Why are protected routes not enough by themselves?  
Answer: Backend/RLS checks are also required.
2. What does admin authorization protect?  
Answer: Approval, election, candidate, region, and eligibility management.

## Week 5

### Juli
1. Why use confirmation modals for status changes?  
Answer: They reduce accidental administrative actions.

### Jarin
1. Why test invalid election dates?  
Answer: Elections must not end before they start.

### Shanzita
1. Why update the database dictionary?  
Answer: It keeps schema documentation aligned with implementation.

### Shazidur
1. Why not implement vote casting in Step 2?  
Answer: Secure voting requires transactional RPC and blockchain work planned for Step 3.
2. Why should ordinary users not read audit logs?  
Answer: Logs may expose sensitive operational details.

## Weeks 6-10 Final Topics

### Juli
1. Why is the vote page focused and minimal?  
Answer: It reduces voter mistakes during a high-risk action.
2. Why should selected candidates have a clear visual state?  
Answer: Voters must know exactly what they are confirming.

### Jarin
1. How do you test duplicate vote prevention?  
Answer: Try one valid vote, then submit again and with simultaneous requests.
2. What responsive areas need special testing?  
Answer: tables, sidebars, charts, forms, and modal windows.

### Shanzita
1. Why document academic limitations?  
Answer: To avoid claiming the prototype is production election software.
2. Why explain the ledger as blockchain-inspired?  
Answer: It is tamper-evident but not decentralized like a public blockchain.

### Shazidur
1. Why must voting happen in a database transaction?  
Answer: Ballot insert, block insert, and `has_voted` update must succeed or fail together.
2. Why lock the eligibility row?  
Answer: It prevents two simultaneous vote requests from both succeeding.
3. Why not expose candidate choice during receipt verification?  
Answer: It protects ballot secrecy.
4. Why should clients not insert into ballots directly?  
Answer: Direct inserts could bypass validation and duplicate-vote checks.
5. Why use RLS even with protected routes?  
Answer: Database rules protect data if frontend checks are bypassed.
