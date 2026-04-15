# Firebase Storage Setup Guide

## CORS Error Fix

If you're getting CORS errors when uploading images, you need to configure Firebase Storage security rules.

## Step 1: Configure Firebase Storage Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Storage** → **Rules** tab
4. Replace the default rules with the following:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload images to their own rooms folder
    match /rooms/{userId}/{roomId}/{allFiles=**} {
      // Allow read access to all authenticated users
      allow read: if request.auth != null;
      
      // Allow write access only to the owner
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Step 2: Publish the Rules

1. Click **Publish** button
2. Wait for the rules to be deployed (usually takes a few seconds)

## Step 3: Verify Authentication

Make sure users are authenticated before uploading. The code automatically checks this, but verify:
- User is signed in via Firebase Auth
- User has a valid Firebase Auth token

## How It Works

1. **Image Upload Flow:**
   - User selects images → Converted to Blob
   - Uploaded to: `rooms/{userId}/{roomId}/image_{index}_{timestamp}.jpg`
   - Firebase Storage returns a download URL
   - URL is stored in Firestore `rooms` collection

2. **Image Rendering:**
   - Images are stored as URLs in Firestore
   - Use the URL directly in `<img src={imageUrl} />` tags
   - URLs are publicly accessible (or restricted by Storage rules)

## Testing

After setting up the rules:
1. Sign in as a user
2. Go through landlord onboarding
3. Upload images
4. Check Firebase Console → Storage to see uploaded files
5. Check Firestore → rooms collection to see image URLs

## Troubleshooting

**CORS Error:**
- Verify Storage rules are published
- Check that user is authenticated
- Ensure Storage bucket exists in Firebase project

**Unauthorized Error:**
- Check that `request.auth.uid == userId` in rules
- Verify the path matches: `rooms/{userId}/{roomId}/...`

**Upload Fails:**
- Check browser console for detailed error
- Verify Storage bucket is enabled
- Check Firebase project billing (Storage requires Blaze plan for some features)

