# Automatic Token Refresh Implementation Guide

## Overview
The system now has automatic token refresh functionality that prevents users from being logged out when their access token expires.

## How It Works

### 1. Token Expiry Settings (Backend)
Location: `backend/app/.env`
```
JWT_ACCESS_EXPIRES_IN=15s   # Access token expires in 15 seconds (for testing)
JWT_REFRESH_EXPIRES_IN=7d    # Refresh token expires in 7 days
```

**For Production**: Change to `JWT_ACCESS_EXPIRES_IN=15m` or `JWT_ACCESS_EXPIRES_IN=1h`

### 2. Auth Interceptor (`auth.interceptor.ts`)
- Intercepts all HTTP requests
- Adds `Authorization: Bearer {token}` header to requests
- When a 401 error occurs:
  1. Checks if refresh token exists
  2. Calls `/users/refresh` endpoint with refresh token
  3. Gets new access token and refresh token
  4. Retries the failed request with new token
  5. User continues working without interruption

### 3. Concurrent Request Handling
- Uses `BehaviorSubject` to queue multiple requests during token refresh
- Only one refresh request at a time
- All pending requests wait for the new token
- Once refreshed, all queued requests retry with new token

### 4. Error Handling
- Only logs out if refresh token is also expired (401/403)
- Network errors don't cause logout
- User only sees unauthorized page if they truly don't have permission

## Testing the Automatic Refresh

### Step 1: Start Backend
```bash
cd backend/app
npm run dev
```
Backend runs on: http://localhost:4000

### Step 2: Start Frontend
```bash
cd frontend
ng serve
```
Frontend runs on: http://localhost:4200

### Step 3: Test the Flow
1. Login as admin:
   - Email: adnan@gmail.com
   - Password: 123456

2. After login, open Browser DevTools Console (F12)

3. Wait for 15 seconds (access token will expire)

4. Navigate to any page or perform any action (e.g., view users list)

5. **What You Should See in Console:**
   ```
   🔄 Access token expired, attempting refresh...
   🔑 Attempting to refresh token... {hasRefreshToken: true}
   ✅ Token refresh successful {hasAccessToken: true, hasRefreshToken: true, user: "adnan@gmail.com"}
   ✅ Token refreshed successfully, retrying request...
   ```

6. **Expected Result:**
   - Request succeeds
   - Data loads normally
   - User stays logged in
   - No redirect to unauthorized page

## Console Logs Explained

### Success Flow:
- `🔄 Access token expired, attempting refresh...` - Interceptor detected 401 error
- `🔑 Attempting to refresh token...` - Calling refresh endpoint
- `✅ Token refresh successful` - New tokens received
- `✅ Token refreshed successfully, retrying request...` - Original request retried

### If Multiple Requests Happen:
- `⏳ Already refreshing, waiting for new token...` - Request queued
- `✅ Got new token from queue, retrying request...` - Request unqueued and retried

### Failure Flow (Only if refresh token expired):
- `❌ Token refresh error:` - Refresh failed
- `🚪 Refresh token invalid, logging out...` - User logged out

## Backend Refresh Token Endpoint

Location: `backend/app/src/controllers/userController.js`

```javascript
export const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Get user and generate new tokens
    const user = await userService.findUserById(decoded.id);
    
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    // Replace old refresh token with new one
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    refreshTokens.push(newRefreshToken);

    res.json({ 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  });
};
```

## Common Issues & Solutions

### Issue 1: Still getting logged out after 15 seconds
**Solution**: Check browser console for errors. The refresh endpoint might be failing.

### Issue 2: Infinite refresh loop
**Solution**: Make sure the refresh endpoint URL includes `/refresh` so it's excluded from auth header.

### Issue 3: 403 Error on refresh
**Solution**: The refresh token might not be in the backend's refreshTokens array. Logout and login again.

### Issue 4: Network errors causing logout
**Solution**: The interceptor should only logout on 401/403. Check the catchError logic.

## Frontend Files Modified

1. **`auth.interceptor.ts`** - Handles 401 errors and triggers refresh
2. **`auth.service.ts`** - Provides refreshToken() method
3. **`app.config.ts`** - Registers interceptors in correct order
4. **`unauthorized.component.html`** - Updated UI for access denied page

## Verification Checklist

- [ ] Backend running on port 4000
- [ ] Frontend running on port 4200
- [ ] Can login successfully
- [ ] Console shows refresh logs after 15 seconds
- [ ] Requests continue working after token refresh
- [ ] No redirect to unauthorized page
- [ ] User data persists after refresh

## Production Checklist

Before deploying to production:

1. Change access token expiry:
   ```env
   JWT_ACCESS_EXPIRES_IN=15m  # or 1h
   ```

2. Remove console.log statements from:
   - `auth.interceptor.ts`
   - `auth.service.ts`

3. Use secure refresh token storage (consider HttpOnly cookies)

4. Implement refresh token rotation (already done)

5. Add rate limiting to refresh endpoint

6. Monitor refresh token usage for security

## Security Considerations

1. **Refresh tokens are stored in localStorage** - Consider using HttpOnly cookies for better security
2. **Token rotation implemented** - Old refresh tokens are invalidated when new ones are issued
3. **Short access token lifetime** - Reduces window for token theft
4. **Long refresh token lifetime** - Balances security with user convenience
5. **Network isolation** - Refresh endpoint doesn't require auth header

## Support

If the automatic refresh is not working:

1. Check browser console for error messages
2. Verify backend is running and accepting requests
3. Check that refresh token exists in localStorage
4. Verify the refresh endpoint returns 200 status
5. Check backend console for any errors

For additional help, review the console logs and trace the request flow.
