# Authentication Test Cases

| ID | Test case | Expected result |
| --- | --- | --- |
| AUTH-01 | Register with valid email, password, phone, region, and 10 digit voter/NID number | Account is created and sent to email verification |
| AUTH-02 | Register with invalid email | Form blocks submission |
| AUTH-03 | Register with weak password | Form shows password strength message |
| AUTH-04 | Register with voter/NID number that is not 10 or 16 digits | Form blocks submission |
| AUTH-05 | Login with wrong password | Friendly invalid login message appears |
| AUTH-06 | Login before email verification | Email verification warning appears |
| AUTH-07 | Request password reset | Confirmation message appears |
| AUTH-08 | Voter opens admin route | User is redirected to unauthorized page |
| AUTH-09 | Unauthenticated user opens voter route | User is redirected to login page |
| AUTH-10 | Suspended or unapproved account attempts voting | Voting access is blocked in later voting phases |
