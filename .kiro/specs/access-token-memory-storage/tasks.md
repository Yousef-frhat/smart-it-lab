# Implementation Plan: Access Token Memory Storage Security Fix

## Overview

This implementation plan addresses a critical XSS vulnerability by migrating access token storage from `localStorage` to in-memory React state. The plan follows a 5-phase incremental migration strategy to ensure zero downtime and easy rollback at each step.

**Security Impact:** Eliminates XSS attack vector for access token theft while maintaining all existing authentication flows.

**Migration Strategy:** Each phase is independently deployable and testable, allowing for gradual rollout and immediate rollback if issues arise.

## Tasks

- [ ] 1. Phase 1: Add memory storage (non-breaking, dual storage)
  - [x] 1.1 Add accessToken state to AuthContext
    - Add `const [accessToken, setAccessToken] = useState<string | null>(null)` to AuthContext
    - Add `getAccessToken` function that returns current accessToken state
    - Add `setAccessTokenInternal` function that updates accessToken state
    - Export both functions in AuthContextType interface
    - Keep all existing localStorage operations intact
    - _Requirements: 1.1, 1.5_

  - [ ] 1.2 Update login flow to write to both storages
    - In `login` function, call `setAccessToken(token)` after successful login
    - Keep existing `localStorage.setItem('accessToken', token)` call
    - Verify token is stored in both memory and localStorage
    - _Requirements: 4.1, 4.2_

  - [~] 1.3 Update register flow to write to both storages
    - In `register` function, call `setAccessToken(token)` after successful registration
    - Keep existing `localStorage.setItem('accessToken', token)` call
    - Verify token is stored in both memory and localStorage
    - _Requirements: 5.1, 5.2_

  - [~] 1.4 Update OAuth callback to write to both storages
    - In OAuth callback handler, call `setAccessToken(token)` after receiving token
    - Keep existing `localStorage.setItem('accessToken', token)` call
    - Verify token is stored in both memory and localStorage
    - _Requirements: 6.2_

  - [ ]* 1.5 Write unit tests for token state management
    - Test `setAccessToken` updates state correctly
    - Test `getAccessToken` returns current token
    - Test token is null on initialization
    - Test token persists across re-renders

- [~] 2. Checkpoint - Verify dual storage works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Phase 2: Update API interceptor to use memory
  - [~] 3.1 Add interceptor initialization function
    - Create `initializeAuthInterceptor(getToken, setToken)` function in api.ts
    - Add module-level variables for token getter/setter references
    - Add null checks in interceptor to handle uninitialized state
    - _Requirements: 2.1_

  - [~] 3.2 Initialize interceptor in AuthContext
    - Add useEffect in AuthContext to call `initializeAuthInterceptor`
    - Pass `getAccessToken` and `setAccessTokenInternal` as arguments
    - Ensure initialization happens before any API calls
    - _Requirements: 2.1_

  - [~] 3.3 Update request interceptor to use token getter
    - Replace `localStorage.getItem('accessToken')` with `getAccessToken()` call
    - Add null check for uninitialized getter
    - Keep Authorization header logic unchanged
    - _Requirements: 2.1_

  - [~] 3.4 Update refresh handler to use token setter
    - Replace `localStorage.setItem('accessToken', newToken)` with `setAccessTokenInternal(newToken)`
    - Keep all other refresh logic unchanged
    - Verify original request is retried with new token
    - _Requirements: 2.2, 8.2, 8.3_

  - [~] 3.5 Update failure handler to use token setter
    - Replace `localStorage.removeItem('accessToken')` with `setAccessTokenInternal(null)`
    - Keep redirect to /auth unchanged
    - _Requirements: 2.4, 8.4_

  - [ ]* 3.6 Write unit tests for API interceptor
    - Test request interceptor uses getAccessToken
    - Test refresh handler calls setAccessTokenInternal
    - Test failure handler clears token via setAccessTokenInternal
    - Test interceptor handles uninitialized state gracefully

- [~] 4. Checkpoint - Verify interceptor uses memory
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Phase 3: Update session restore to use refresh token
  - [~] 5.1 Replace localStorage check with refresh attempt
    - Remove `localStorage.getItem('accessToken')` check from session restore useEffect
    - Call `/auth/refresh-token` endpoint on mount
    - Store returned token via `setAccessToken(newToken)`
    - Chain user data fetch after successful refresh
    - _Requirements: 3.1, 3.2, 3.4_

  - [~] 5.2 Handle refresh failure gracefully
    - Catch refresh errors and call `setAccessToken(null)`
    - Remove localStorage cleanup from error handler
    - Ensure loading state is cleared in finally block
    - _Requirements: 3.3_

  - [~] 5.3 Ensure session restore completes before routing
    - Verify `isLoading` state prevents premature route rendering
    - Test that protected routes wait for session restore
    - _Requirements: 3.5_

  - [ ]* 5.4 Write integration tests for session restore
    - Test successful refresh restores session
    - Test failed refresh leaves user logged out
    - Test no localStorage reads occur
    - Test loading state prevents premature rendering

- [~] 6. Checkpoint - Verify session restore works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Phase 4: Remove localStorage writes
  - [~] 7.1 Remove localStorage write from login flow
    - Remove `localStorage.setItem('accessToken', token)` from login function
    - Verify only `setAccessToken(token)` is called
    - Test login flow still works correctly
    - _Requirements: 1.2, 4.1_

  - [~] 7.2 Remove localStorage write from register flow
    - Remove `localStorage.setItem('accessToken', token)` from register function
    - Verify only `setAccessToken(token)` is called
    - Test registration flow still works correctly
    - _Requirements: 1.2, 5.1_

  - [~] 7.3 Remove localStorage write from OAuth callback
    - Remove `localStorage.setItem('accessToken', token)` from OAuth callback handler
    - Verify only `setAccessToken(token)` is called
    - Test OAuth flow still works correctly
    - _Requirements: 1.2, 6.4_

  - [~] 7.4 Remove localStorage cleanup from logout flow
    - Remove `localStorage.removeItem('accessToken')` from logout function
    - Verify only `setAccessToken(null)` is called
    - Test logout flow still works correctly
    - _Requirements: 1.2, 7.2_

  - [ ]* 7.5 Write integration tests for auth flows
    - Test login stores token only in memory
    - Test register stores token only in memory
    - Test OAuth stores token only in memory
    - Test logout clears memory token
    - Test localStorage remains empty after all operations

- [~] 8. Checkpoint - Verify no localStorage operations remain
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Phase 5: Optional cleanup and migration helper
  - [~] 9.1 Add legacy token cleanup on mount
    - Add one-time check for `localStorage.getItem('accessToken')` in AuthContext
    - If found, log migration message and remove it
    - Add comment explaining this is temporary migration code
    - _Requirements: 9.4_

  - [~] 9.2 Verify no localStorage references remain
    - Search codebase for `localStorage.getItem('accessToken')`
    - Search codebase for `localStorage.setItem('accessToken'`
    - Search codebase for `localStorage.removeItem('accessToken')`
    - Verify all references are removed except migration helper
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 9.3 Write security validation tests
    - Test XSS simulation script (localStorage returns null)
    - Test sessionStorage returns null
    - Test token not in document.cookie
    - Test token not on window object
    - Test refresh token is httpOnly
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [~] 9.4 Update documentation
    - Update README.md security section
    - Update guidelines/Guidelines.md auth flow
    - Update .kiro/steering/risks-and-antipatterns.md (remove localStorage risk)
    - Update .kiro/steering/dev-workflow.md auth flow reference
    - Add inline comments explaining memory storage pattern

- [~] 10. Final checkpoint - Complete security validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each phase is independently deployable and testable
- Rollback is possible at any phase by reverting to previous deployment
- Phase 1-2 maintain backward compatibility (dual storage)
- Phase 3-4 complete the migration (memory-only storage)
- Phase 5 is cleanup and can be deferred to a future release
- All changes are in frontend only - no backend modifications required
- Testing should be done after each phase before proceeding to the next
