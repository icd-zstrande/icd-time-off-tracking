# Time Off Tracking Application

A web application for managing employee time off requests and tracking leave balances.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Copy `src/firebase.example.js` to `src/firebase.js`
   - Create a new project in [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication and Firestore
   - Replace the placeholder values in `firebase.js` with your Firebase project credentials

4. Start the development server:
```bash
npm start
```

5. Build for production:
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

The `firebase.js` file containing your Firebase credentials is gitignored to prevent exposing sensitive information. Make sure to:
1. Never commit your actual Firebase credentials
2. Keep your credentials secure
3. Use appropriate environment variables in production
