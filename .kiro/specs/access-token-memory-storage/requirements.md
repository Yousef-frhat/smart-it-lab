# Requirements Document

## Introduction

This document specifies the requirements for fixing a critical security vulnerability in the Smart IT Lab authentication system. Currently, the access token is stored in `localStorage`, making it vulnerable to XSS (Cross-Site Scripting) attacks. Any malicious script injected into the application can steal the token and impersonate users.

The fix moves the access token from persistent browser storage to in-memory React state, eliminating the XSS attack vector while maintaining all existing authentication flows. The refresh token remains correctly stored as an httpOnly cookie, which is already secure against XSS.

## Glossary

- **Access_Token**: Short-lived JWT (15 minutes) used to authenticate API requests via Bearer Authorization header
- **Refresh_Token**: Long-lived token (7 days) stored as httpOnly cookie, used to obtain new access tokens
- **Auth_Context**: React Context providing global authentication state and methods
- **API_Interceptor**: Axios request/response interceptor that attaches tokens and handles token refresh
- **Session_Restore**: Process of re-establishing user session on page load/refresh using the refresh token
- **OAuth_Flow**: Third-party authentication via GitHub or Google providers
- **XSS**: Cross-Site Scripting attack where malicious scripts access browser storage

## Requirements

### Requirement 1: Store Access Token in Memory

**User Story:** As a security-conscious developer, I want the access token stored only in React state (memory), so that XSS attacks cannot steal it from localStorage.

#### Acceptance Criteria

1. THE Auth_Context SHALL store the access token in a React state variable
2. THE Auth_Context SHALL NOT write the access token to localStorage at any point
3. THE Auth_Context SHALL NOT read the access token from localStorage at any point
4. WHEN the browser tab is closed or refreshed, THE access token SHALL be cleared from memory
5. THE Auth_Context SHALL export a getter function that returns the current access token from state

### Requirement 2: Update API Interceptor to Use Token Getter

**User Story:** As a developer, I want the Axios interceptor to retrieve the token from a getter function, so that it always uses the current in-memory token.

#### Acceptance Criteria

1. THE API_Interceptor request handler SHALL call a token getter function instead of reading from localStorage
2. THE API_Interceptor refresh handler SHALL update the in-memory token via a setter function after successful refresh
3. THE API_Interceptor refresh handler SHALL NOT write the new access token to localStorage
4. WHEN a token refresh fails, THE API_Interceptor SHALL clear the in-memory token via the setter function

### Requirement 3: Session Restore via Refresh Token

**User Story:** As a user, I want my session to persist across page refreshes, so that I don't have to log in every time I reload the page.

#### Acceptance Criteria

1. WHEN the application loads and no access token exists in memory, THE Auth_Context SHALL attempt to restore the session via the refresh token endpoint
2. WHEN the refresh token endpoint returns a new access token, THE Auth_Context SHALL store it in memory and fetch user data
3. WHEN the refresh token is invalid or expired, THE Auth_Context SHALL remain in logged-out state
4. THE session restore process SHALL NOT check localStorage for an access token
5. THE session restore process SHALL complete before rendering protected routes

### Requirement 4: Maintain Login Flow Compatibility

**User Story:** As a user, I want to log in with email/password, so that I can access my account.

#### Acceptance Criteria

1. WHEN a user submits valid credentials to the login endpoint, THE Auth_Context SHALL store the returned access token in memory
2. WHEN login succeeds, THE Auth_Context SHALL set the user state with the returned user data
3. WHEN login succeeds, THE Auth_Context SHALL apply the user's saved theme
4. WHEN login fails, THE Auth_Context SHALL NOT store any token

### Requirement 5: Maintain Registration Flow Compatibility

**User Story:** As a new user, I want to register an account, so that I can start using the platform.

#### Acceptance Criteria

1. WHEN a user submits valid registration data, THE Auth_Context SHALL store the returned access token in memory
2. WHEN registration succeeds, THE Auth_Context SHALL set the user state with the returned user data
3. WHEN registration succeeds, THE Auth_Context SHALL apply the default theme
4. WHEN registration fails, THE Auth_Context SHALL NOT store any token

### Requirement 6: Maintain OAuth Flow Compatibility

**User Story:** As a user, I want to log in with GitHub or Google, so that I can use my existing accounts.

#### Acceptance Criteria

1. WHEN a user initiates OAuth login, THE Auth_Context SHALL redirect to the provider's authorization URL
2. WHEN the OAuth callback returns with a token parameter, THE Auth_Context SHALL store it in memory
3. WHEN the OAuth callback completes, THE Auth_Context SHALL fetch user data and set user state
4. THE OAuth flow SHALL NOT write the access token to localStorage at any point

### Requirement 7: Maintain Logout Flow Compatibility

**User Story:** As a user, I want to log out, so that my session is terminated.

#### Acceptance Criteria

1. WHEN a user logs out, THE Auth_Context SHALL call the logout endpoint to invalidate the refresh token
2. WHEN logout completes, THE Auth_Context SHALL clear the in-memory access token
3. WHEN logout completes, THE Auth_Context SHALL clear the user state
4. THE logout flow SHALL NOT attempt to remove the access token from localStorage

### Requirement 8: Token Refresh Mechanism

**User Story:** As a user, I want my session to automatically refresh when the access token expires, so that I don't get logged out during active use.

#### Acceptance Criteria

1. WHEN an API request returns 401 Unauthorized, THE API_Interceptor SHALL attempt to refresh the access token
2. WHEN the refresh succeeds, THE API_Interceptor SHALL store the new access token in memory
3. WHEN the refresh succeeds, THE API_Interceptor SHALL retry the original failed request with the new token
4. WHEN the refresh fails, THE API_Interceptor SHALL clear the in-memory token and redirect to login
5. THE token refresh mechanism SHALL use the httpOnly refresh cookie automatically

### Requirement 9: Backward Compatibility Cleanup

**User Story:** As a developer, I want to remove all localStorage access token references, so that the codebase is clean and consistent.

#### Acceptance Criteria

1. THE codebase SHALL NOT contain any `localStorage.getItem('accessToken')` calls
2. THE codebase SHALL NOT contain any `localStorage.setItem('accessToken', ...)` calls
3. THE codebase SHALL NOT contain any `localStorage.removeItem('accessToken')` calls
4. WHEN the application loads, THE Auth_Context MAY optionally clear any legacy access token from localStorage for migration purposes

### Requirement 10: Security Improvement Verification

**User Story:** As a security auditor, I want to verify that XSS attacks cannot steal the access token, so that I can confirm the vulnerability is fixed.

#### Acceptance Criteria

1. WHEN a malicious script attempts to read localStorage, THE access token SHALL NOT be present
2. WHEN a malicious script attempts to read sessionStorage, THE access token SHALL NOT be present
3. WHEN a malicious script attempts to read document.cookie, THE access token SHALL NOT be present
4. THE access token SHALL only be accessible within the Auth_Context closure and API_Interceptor closure
5. THE refresh token SHALL remain in an httpOnly cookie, inaccessible to JavaScript
