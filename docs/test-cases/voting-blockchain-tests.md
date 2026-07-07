# Voting, Blockchain, Results, Fraud, and Responsive Test Cases

| Area | Test case | Expected result |
| --- | --- | --- |
| Voting | Valid vote | Receipt and block data returned |
| Voting | No candidate selected | Submit disabled or error shown |
| Voting | Invalid candidate | RPC rejects and logs fraud |
| Voting | Duplicate vote | RPC rejects and logs critical fraud |
| Voting | Two simultaneous duplicate requests | One succeeds, one fails |
| Voting | Wrong region | RPC rejects and logs fraud |
| Voting | Pending/rejected/suspended voter | RPC rejects |
| Voting | Vote before start or after end | RPC rejects |
| Voting | Cancelled election | Vote rejected |
| Blockchain | Valid chain | Verification succeeds |
| Blockchain | Changed data/current/previous hash | Verification fails |
| Blockchain | Missing or duplicate block | Verification fails |
| Blockchain | Reordered blocks | Verification fails |
| Blockchain | Missing ballot | Verification fails |
| Results | Hidden/live/after-end results | Visibility rules apply |
| Results | Turnout and candidate percentage | Aggregate values are correct |
| Fraud | Duplicate vote and wrong region logs | Fraud log appears |
| Responsive | Mobile/tablet/desktop forms and tables | Layout remains usable |
