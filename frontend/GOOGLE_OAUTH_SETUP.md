# Google OAuth Client Setup for Aptos Keyless Authentication

## Error: "The OAuth client was not found"

If you're seeing this error, it means the Google OAuth client ID configured in your application is invalid or not properly set up.

## How to Fix This Issue

### Step 1: Create a Google OAuth Client ID

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name for your OAuth client
7. Set the authorized JavaScript origins to include:
   - Your development server (e.g., `http://localhost:3000`)
   - Your production domain if applicable
8. Set the authorized redirect URIs to include:
   - Development: `http://localhost:3000/login/google/callback`
   - Production: `https://yourdomain.com/login/google/callback` (if applicable)
9. Click "Create" to generate your client ID and client secret

### Step 2: Update Your Environment Variables

After obtaining your new client ID, update your `.env` file:

```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
```

### Step 3: Ensure Environment Variables Are Being Loaded

For Create React App projects, make sure:
1. All environment variables are prefixed with `REACT_APP_`
2. You restart your development server after making changes to the `.env` file

### Additional Troubleshooting

If you continue to have issues:

1. Verify that your redirect URI exactly matches what's configured in the Google Cloud Console
2. Check that your application is using the correct client ID
3. Ensure you're not mixing development and production credentials

## OAuth Consent Screen Setup

Don't forget to configure your OAuth consent screen:

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless your app is restricted to your organization)
3. Fill in required application information
4. Add necessary scopes (at minimum: `openid`, `email`, `profile`)
5. Add test users if your app is in testing mode 