- [ ] **Backend (`backend/index.js`)**
  - [ ] Add `POST /api/auth/register-send-otp`: Accept registration fields, hash password, generate OTP, send email, and return JWT containing pending user details.
  - [ ] Modify `POST /api/auth/register`: Accept `token` and `otp`, decode JWT, verify OTP in database, create `employee_id`, and insert into `employees` table.

- [ ] **Frontend (`frontend/app/register/page.tsx`)**
  - [ ] Introduce a mechanism to track steps (`FORM` vs `OTP` vs `SUCCESS`).
  - [ ] Connect the first step to `POST /api/auth/register-send-otp` to receive the temporary token.
  - [ ] Connect the second step to `POST /api/auth/register` to finalize verification.
  - [ ] Ensure existing error and success UI matches the new flow correctly.
