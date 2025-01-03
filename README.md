# Time Off Tracking Application

A web application for managing employee time off requests and tracking leave balances.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new project in [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication and Firestore
   - Copy `.env.example` to `.env.local` for local development
   - Fill in your Firebase project credentials in `.env.local`

4. For Netlify deployment:
   - Go to your Netlify site settings
   - Navigate to "Build & deploy" → "Environment variables"
   - Add the following environment variables with your Firebase credentials:
     - REACT_APP_FIREBASE_API_KEY
     - REACT_APP_FIREBASE_AUTH_DOMAIN
     - REACT_APP_FIREBASE_PROJECT_ID
     - REACT_APP_FIREBASE_STORAGE_BUCKET
     - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
     - REACT_APP_FIREBASE_APP_ID

5. Start the development server:
```bash
npm start
```

6. Build for production:
```bash
npm run build
```

## Features

- User authentication
- Time off request management
- Leave balance tracking
- Manager approval workflow
- Dark/light theme support
- Responsive design

## Security

The Firebase configuration uses environment variables to keep sensitive information secure:
1. Never commit your `.env.local` file
2. Set environment variables in your deployment platform
3. Use appropriate access controls in Firebase Console
