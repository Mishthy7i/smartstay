# Student Rental PWA

A Progressive Web App for student rental housing with Firebase authentication and Material UI.

## Features

- 🔐 Firebase Authentication (Google Sign-In & Email/Password)
- 👤 User Profile Management
- 🎭 Role-based System (Student/Landlord)
- 🎨 Material UI Components
- 🛡️ Protected Routes
- 📱 PWA Support

## Setup

### Environment Variables

Create a `.env` file in the root of the `pwa` directory with the following Firebase configuration variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

These values can be found in your Firebase project settings.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
pwa/src/
├── firebase.js              # Firebase initialization
├── context/
│   └── AuthContext.jsx      # Authentication context with role management
├── pages/
│   ├── Login.jsx            # Authentication page
│   ├── Home.jsx             # Profile/homepage
│   └── Logout.jsx           # Logout handler
├── components/
│   └── ProtectedRoute.jsx   # Route protection component
├── App.jsx                  # Main app with routing
└── main.jsx                 # Entry point with providers
```

## Architecture

This PWA is a **complete Firebase-based application** with no backend dependency:
- **Firebase Authentication**: User authentication (Google & Email/Password)
- **Cloud Firestore**: All data storage (users, rooms, onboarding data)
- **Firebase Storage**: Image storage for property photos

## Authentication

The app supports two authentication methods:

1. **Google Sign-In**: One-click authentication with Google account
2. **Email/Password**: Traditional email and password authentication with sign-up support

## Role Management

User roles are stored in Firestore under the `users` collection:
- Default role: `student`
- Alternative role: `landlord`
- Roles are automatically created on first login
- Roles cannot be changed after account creation

## Onboarding System

### Onboarding Status Check
- Onboarding status is checked from Firestore on every sign-in
- If `is_onboarded: false`, user is redirected to appropriate onboarding flow
- Onboarding data is saved directly to Firestore `users` collection

### Student Onboarding
- Collects: college, budget range, room preferences, priorities
- Saves to Firestore `users/{uid}` document
- Marks `is_onboarded: true` upon completion

### Landlord Onboarding
- 3-step process:
  1. **Property Photos**: Upload images to Firebase Storage
  2. **Property Details**: Title, price, location, type, contact, description
  3. **Amenities & Preferences**: Amenities, furnished status, gender preference
- Images are uploaded to Firebase Storage: `rooms/{userId}/{roomId}/image_*.jpg`
- Property data is saved to Firestore `rooms` collection
- Marks `is_onboarded: true` upon completion

## Data Storage

### Firestore Collections

**`users` collection:**
- Document ID: User's Firebase UID
- Fields:
  - `user_id`: Firebase UID
  - `email`: User email
  - `name`: User display name
  - `role`: 'student' or 'landlord'
  - `is_onboarded`: Boolean flag
  - `created_at`: Timestamp
  - `onboarded_at`: Timestamp
  - For students: `college`, `min_budget`, `max_budget`, `preferred_room_types`, `priorities`, `max_distance_km`

**`rooms` collection:**
- Document ID: Auto-generated room ID
- Fields:
  - `room_id`: Room identifier
  - `title`: Property title
  - `price`: Monthly rent
  - `type`: Property type
  - `location`: Property location
  - `amenities`: Array of amenities
  - `images`: Array of Firebase Storage URLs
  - `landlord_id`: User ID of landlord
  - `landlord_name`: Name of landlord
  - `contact_number`: Contact number
  - `description`: Property description
  - `furnished`: Boolean
  - `gender_preference`: 'any', 'male', or 'female'
  - `created_at`: Timestamp

### Firebase Storage

**Image Storage Path:**
- `rooms/{userId}/{roomId}/image_{index}_{timestamp}.jpg`
- Images are converted from base64 to Blob before upload
- Download URLs are stored in Firestore `rooms` collection

## Routes

- `/login` - Authentication page
- `/home` - User profile page (protected)
- `/logout` - Logout handler
- `/` - Redirects to `/home`
