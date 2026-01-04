# Authentication Guide (Frontend)

Summary:
- Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/refresh`
- Server sets a cookie named `token` on successful login. The login response also contains a `token` field in JSON.

How to authenticate (recommended):
- Preferred: use the httpOnly cookie set by the server. When making fetch/XHR requests from browser, include credentials.
  - Fetch example:

```js
fetch(`${process.env.API_BASE_URL}/auth/login`, {
  method: 'POST',
  credentials: 'include', // important to send/receive cookie
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

- Alternative (explicit Authorization header): the response includes a `token` string. You can store temporarily (memory) and attach `Authorization: Bearer <token>` for subsequent requests.

Notes about token lifecycle:
- Current backend `generateToken` uses `jwt.sign({ id }, SESSION_SECRET)` without expiry. That means tokens currently do not expire by default.
- `/api/auth/refresh` re-issues a token and sets cookie again. The refresh endpoint is protected (requires a valid token). Because tokens currently have no expiry, refresh is currently optional.

Endpoints:
- POST /api/auth/register
  - Body: { email, password, role?, name?, cnicNumber?, phoneNumber?, fatherName? }
  - Response: 201 created with user data (no token in body for purchaser/service_provider flow currently).

- POST /api/auth/login
  - Body: { email, password }
  - Response: 200 JSON containing `data` (user) and `token`; server sets `token` cookie (httpOnly, sameSite=strict).

- POST /api/auth/logout
  - Clears cookie. Call with `credentials: 'include'`.

- GET /api/auth/me
  - Returns current user. Must send cookie or `Authorization` header.

- POST /api/auth/refresh
  - Protected route: call with existing valid token to get a new token cookie and JSON `token`.

Frontend best practices:
- Use `credentials: 'include'` for API calls to rely on httpOnly cookie.
- If using Authorization header, prefer storing token only in memory (avoid localStorage) and refresh on page reload via `/auth/refresh` if you choose to implement expiry later.
- Protect routes in frontend by calling `/auth/me` at app start to fetch user and role information.
