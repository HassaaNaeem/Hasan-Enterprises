# Error Handling Guide

Standard response format used across the backend:
- Success responses:
  - HTTP status: 200 / 201 / other success codes
  - Body: { success: true, data: <object>, message?: <string> }
- Error responses (middleware/errorHandler.js):
  - HTTP status: appropriate code (400, 401, 403, 404, 500)
  - Body: { success: false, message: <string> }

Common cases and status codes:
- 400 Bad Request: validation errors, duplicate fields (Mongo 11000), invalid input.
- 401 Unauthorized: missing/invalid token, user not found, account deactivated.
- 403 Forbidden: role-based authorization failure or action not allowed.
- 404 Not Found: resource not found (CastError maps to 404 in error handler).
- 500 Internal Server Error: unexpected errors.

Examples:
- Validation error:
  - 400
  - { "success": false, "message": "<validation message>" }

- Auth errors:
  - 401
  - { "success": false, "message": "Not authorized, no token" }

- Resource not found:
  - 404
  - { "success": false, "message": "Plot not found" }

Frontend guidance:
- Always check `success` boolean first.
- For 401: redirect to login flow. Use `credentials: 'include'` to ensure cookies are sent.
- For 403: show permission denied UI.
- For 400: show validation messages to user where appropriate.
- For 500: show generic "Something went wrong" message and optionally capture error context for debugging.

Notes / Recommendations:
- Add structured `error.code` and `error.details` fields to responses later for better client handling.
- Consider adding request-id header or correlation id for production tracing.
