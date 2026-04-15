# 🔥 QUICK FIX: Firebase Storage CORS Error

## The Problem
You're getting a CORS error because Firebase Storage security rules are blocking the upload.

## The Solution (2 minutes)

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project: **student-rental-gdg**

### Step 2: Navigate to Storage Rules
1. Click **Storage** in the left sidebar
2. Click the **Rules** tab (at the top)

### Step 3: Replace the Rules
Copy and paste this EXACT code:

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

### Step 4: Publish
1. Click the **Publish** button
2. Wait 10-20 seconds for rules to deploy

### Step 5: Test
1. Go back to your app
2. Try uploading an image again
3. It should work now! ✅

## Why This Works
- The rules allow authenticated users to read any room images
- Users can only write (upload) to their own folder: `rooms/{userId}/...`
- This matches the path structure in your code: `rooms/${userId}/${roomId}/image_*.jpg`

## Still Having Issues?
1. **Check Authentication**: Make sure you're logged in
2. **Check Browser Console**: Look for other errors
3. **Verify Project**: Make sure you're using the correct Firebase project
4. **Wait a Bit**: Rules can take up to 30 seconds to propagate

## Alternative: Temporary Open Rules (NOT RECOMMENDED FOR PRODUCTION)
If you need to test quickly, you can temporarily use these rules (REMOVE AFTER TESTING):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **WARNING**: This allows any authenticated user to read/write anywhere. Only use for testing!

