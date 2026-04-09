# Email Verification for Registration Plan

To ensure security and prevent fake accounts, we will adapt the stateless OTP strategy (used in Forgot Password) into the Employee Registration flow.

## User Review Required

> [!IMPORTANT]
> - **Stateless Registration**: Instead of storing unverified users in your database, the initial form submission will package the employee's details (`name`, `email`, `department`, hashed `password`) into a temporary JWT. This token acts as a secure "pending registration ticket" alongside the OTP.
> - **Flow changes**: The frontend `/register` page will gain an intermediate "Verify Email" step before reaching the existing "Registration Successful" screen.
> 
> Please read the proposed changes below and confirm if this aligns with your expectations!

## Proposed Changes

### 1. Backend (`backend/index.js`)

#### [NEW] `POST /api/auth/register-send-otp`
- Receives the initial form (`email`, `password`, `name`, `department`).
- Checks if the employee already exists in the `employees` table.
- Hashes the password securely.
- Generates a 6-digit OTP and saves it to the `email_otps` table.
- Sends the OTP to the user's inbox using `nodemailer`.
- Wraps the pending details (`email, name, department, password_hash`) into a short-lived JSON Web Token (JWT) and returns it.

#### [MODIFY] `POST /api/auth/register` (becomes the verification endpoint)
- Receives the payload `{ token, otp }`.
- Decrypts the token to recover the pending employee details.
- Validates the `otp` by checking the `email_otps` table.
- Upon success, generates the internal `employee_id` and permanently inserts the newly verified user into the `employees` table.
- Deletes the OTP cleanup record.

### 2. Frontend (`frontend/app/register/page.tsx`)

#### [MODIFY] `app/register/page.tsx`
- Refactor the component to use a `step` state mechanism (`FORM` ➔ `OTP` ➔ `SUCCESS`).
- **FORM Mode**: The user inputs details. On submit, calls `register-send-otp` and receives the token.
- **OTP Mode**: Prompts the user for the 6-digit code. Submits `{ token, otp }` to the final `register` endpoint.
- **SUCCESS Mode**: Re-uses the existing successful registration screen advising them about pending Admin Approval and Face registration.
