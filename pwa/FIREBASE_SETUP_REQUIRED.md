# 🔥 FIREBASE SETUP REQUIRED - IMPORTANT!

## ⚠️ Your App Won't Work Until You Complete These Steps

The landlord listings aren't saving and students can't see rooms because **Firebase security rules need to be configured**.

## Step 1: Configure Firestore Rules (Database)

1. Go to https://console.firebase.google.com/
2. Select your project: **student-rental-gdg**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. **Replace ALL the existing rules** with this code:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Rooms collection - authenticated users can read all, landlords can write their own
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.landlord_id == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.landlord_id == request.auth.uid;
    }
    
    // Swipes collection - users can read/write their own swipes
    match /swipes/{swipeId} {
      allow read: if request.auth != null && resource.data.user_id == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.user_id == request.auth.uid;
    }
  }
}
```

6. Click **Publish**
7. Wait 10-20 seconds

## Step 2: Configure Storage Rules (Images)

1. Still in Firebase Console
2. Click **Storage** in the left sidebar
3. Click the **Rules** tab at the top
4. **Replace ALL the existing rules** with this code:

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

5. Click **Publish**
6. Wait 10-20 seconds

## Step 3: Test Your App

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. **Sign in as a Landlord**
3. Try listing a property with images
4. It should now save successfully! ✅
5. **Sign in as a Student**
6. You should now see the rooms! ✅

## ⚠️ Common Issues

### Issue: "Permission Denied" errors
**Solution**: Make sure you published BOTH Firestore AND Storage rules

### Issue: Still not working after 30 seconds
**Solution**: 
1. Sign out and sign back in
2. Clear browser cache
3. Check browser console (F12) for specific errors

### Issue: Images upload but room doesn't save
**Solution**: Check Firestore rules are published correctly

## 🎉 After Setup

Once both rules are published, your app will work perfectly:
- ✅ Landlords can list properties with images
- ✅ Students can see and swipe through rooms
- ✅ Recommendation engine will show best matches first
- ✅ Maps will show property locations
- ✅ Liked rooms will be saved

## Need Help?

If you're still having issues after completing these steps:
1. Open browser console (F12)
2. Look for red error messages
3. Share the exact error message for help
