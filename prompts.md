# Prompt Log

This file contains the prompts which i used while building and fixing the OTP login assignment. These are the main things i asked during different stages of development.

## 1. Build the initial application

Build a full stack OTP based login and checkout application as per the assignment. Use react with typescript for frontend, express and typescript for backend and postgres for database. Keep frontend backend and database seperate.

Need registration form with email, first name, last name and phone number. After registration generate a random 6 digit OTP and show it to the user.

Also make a checkout form where user can enter email phone number and shipping address. Email should be validated while typing and it should check in background if user is already registered or not.

If required show OTP login modal and user should also get option to skip login. If OTP is wrong show error inside the modal itself. When user is logged in show his name on top of checkout page.

On checkout submit save the data in database. No need to add any payment functionality.

## 2. Add validation and authentication

Now add proper validation on frontend and backend for registration, checkout, email, phone number, address and OTP.

Implement session based authentication using http only cookie. OTP and session values should be stored in hashed format where needed. Also OTP should expire and there should be limit for wrong OTP attempts.

Use parameterized queries for database so that sql injection issue can be avoided.

Need APIs for register, verify otp, check current login user, logout, check registered email and submit checkout.

## 3. PostgreSQL database schema

Create the postgres schema file in the project itself for users, otp verification, login sessions and checkout data.

Add foreign keys, timestamps and indexes wherever required. Schema should be written in a way that it can be run multiple times without creating errors.

## 4. Connect frontend with backend APIs

Connect the frontend with the backend using a small typed API client. Integrate registration, checkout, OTP verification, current user check, logout and registered email check.

Make sure credentials are included in requests so that the http only cookie is also sent with API calls.

## 5. Improve checkout UI

Make some changes in checkout flow. After successful checkout the submit button should not be visible and the entered details should become readonly.

Also dont show unnecessary lookup status messages all the time. Invalid OTP should not be allowed to submit.

Keep proper success and error messages so user can understand what happened.

## 6. Prepare for deployment

Prepare frontend for deployment on vercel and backend for render or any node js supported hosting.

Add env example files and deployment instructions. Configure the SPA fallback also so that frontend routes work when opened directly after deployment.

Dont commit any secret keys or local env files to github.

## 7. Fix session issue in production

After deploying frontend on vercel and backend on render i found one issue. OTP verification was returning 200 response but when i tried to submit checkout it was giving authentication required error.

Please check the session cookie and cors configuration and fix this for production while keeping local development working as before.

Cookie settings should support the deployed frontend and backend setup. Also allow credential requests from the configured frontend origin.

## 8. Use Vercel proxy for API calls

Instead of calling render backend directly from browser, make frontend API calls go through the vercel domain.

Add rewrite rule in vercel for /api/* and use relative API path when frontend API url is not configured explicitly. Keep existing vite proxy for local development.

This should help to keep API requests on same frontend domain and make session cookie work properly in normal browser and incognito also.

## 9. Final testing and verification

Before completing the assignment run frontend and backend build and lint checks and verify all main flows are working properly.

Check registration, OTP verification, authenticated checkout submission, postgres schema, deployment settings and repository files. If anything is missing mention it clearly.

Final checks completed successfully for backend build and type checking, frontend build, backend lint/type check and frontend lint. Also tested deployed OTP verification and authenticated checkout successfully.
