# Admin and Voter Management Test Cases

| Area | Test case | Expected result |
| --- | --- | --- |
| Voter profile | View profile | Profile fields are visible |
| Voter profile | Update full name, phone, DOB, region | Allowed fields update |
| Voter profile | Attempt role change | Blocked by UI and RLS |
| Voter profile | Attempt approval status change | Blocked by UI and RLS |
| Admin access | Voter opens admin page | Redirect to unauthorized |
| Admin access | Unauthenticated access | Redirect to login |
| Admin access | Admin access | Admin page opens |
| Regions | Create region | Region appears |
| Regions | Edit region | Region updates |
| Regions | Delete unused region | Region is removed |
| Regions | Duplicate code | Error appears |
| Regions | Delete used region | Blocked |
| Elections | Valid creation | Election appears |
| Elections | Missing title | Error appears |
| Elections | Invalid dates | Error appears |
| Elections | Completed to active | Blocked without safe rule |
| Elections | Cancelled election | Cannot accept votes in later voting phase |
| Candidates | Valid creation | Candidate appears |
| Candidates | Missing election | Error appears |
| Candidates | Invalid region | Error appears |
| Candidates | Disable candidate | Candidate becomes inactive |
| Voter approval | Approve/reject/suspend/pending | Status changes only after confirmation |
