# Google Fit API Integration Setup

## Environment Variables

Create a `.env.local` file in your project root and add:

```env
# Google Fit API Configuration
REACT_APP_GOOGLE_FIT_CLIENT_ID=your_google_client_id_here
```

## Google Cloud Console Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your project ID

### 2. Enable Google Fit API
1. Navigate to "APIs & Services" > "Library"
2. Search for "Fitness API"
3. Click on "Fitness API" and enable it

### 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Add authorized origins:
   - `http://localhost:8080` (for development)
   - `https://yourdomain.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:8080` (for development)
   - `https://yourdomain.com` (for production)
6. Copy the Client ID and add it to your `.env.local` file

### 4. Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: "DilCare Health App"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/fitness.activity.read`
   - `https://www.googleapis.com/auth/fitness.body.read`
   - `https://www.googleapis.com/auth/fitness.location.read`
   - `https://www.googleapis.com/auth/fitness.sleep.read`

## Required Permissions

The app requests the following Google Fit permissions:

- **Fitness Activity**: Read step count, distance, and activity data
- **Fitness Body**: Read weight, height, and body composition data
- **Fitness Location**: Read location-based activity data
- **Fitness Sleep**: Read sleep duration and quality data

## Security Considerations

1. **API Key Protection**: Never commit your Google Client ID to public repositories
2. **HTTPS Required**: Google Fit API requires HTTPS in production
3. **Domain Verification**: Ensure your domain is added to authorized origins
4. **User Consent**: Users must explicitly grant permissions for data access

## Testing

1. Start your development server: `npm run dev`
2. Navigate to the Step Tracker page
3. Click "Connect Google Fit" in the Data Sources section
4. Grant permissions when prompted
5. Verify that data is being fetched correctly

## Troubleshooting

### Common Issues:

1. **"Unauthorized" Error**
   - Check if your Client ID is correct
   - Verify authorized origins include your domain
   - Ensure Fitness API is enabled

2. **"Consent Required" Error**
   - Complete OAuth consent screen setup
   - Add required scopes
   - Submit for verification if needed

3. **"No Data" Error**
   - User may not have any fitness data in Google Fit
   - Try adding test data through Google Fit app
   - Check if user has granted all permissions

4. **CORS Errors**
   - Verify authorized origins in Google Cloud Console
   - Check that your domain exactly matches the configuration

## Production Deployment

1. Update authorized origins with your production domain
2. Use HTTPS for all production deployments
3. Set environment variables on your hosting platform
4. Test thoroughly with real Google Fit data

## Data Privacy

- The app only requests read access to fitness data
- No data is stored on external servers
- Users can disconnect at any time
- All data access follows Google Fit API privacy policies
