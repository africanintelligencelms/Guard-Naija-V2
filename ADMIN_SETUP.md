# Guard Nigeria - Create Admin User

This script helps you create the first admin user for the Guard Nigeria platform.

## Steps:

1. **Open Firebase Console**: Go to [Firebase Console](https://console.firebase.google.com/project/guard-nigeria/authentication/users)

2. **Add User Manually**:

   - Click "Add User"
   - Email: `admin@guardnigeria.gov` (or your preferred admin email)
   - Password: Create a strong password
   - Click "Add User"

3. **Add User Profile to Firestore**:

   - Go to [Firestore Database](https://console.firebase.google.com/project/guard-nigeria/firestore)
   - Create a collection called `users`
   - Add a document with the UID from the user you just created
   - Add the following fields:
     ```json
     {
       "uid": "<USER_UID_FROM_AUTH>",
       "email": "admin@guardnigeria.gov",
       "role": "admin",
       "displayName": "System Administrator",
       "createdAt": <CURRENT_TIMESTAMP>,
       "lastLogin": <CURRENT_TIMESTAMP>,
       "isActive": true
     }
     ```

4. **Login**: You can now login with the admin credentials!

## Firestore Security Rules

Update your `firestore.rules` file with the following rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function to get user data
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    // Helper function to check user role
    function hasRole(role) {
      return isSignedIn() && getUserData().role == role;
    }

    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isSignedIn() && request.auth.uid == userId;

      // Only admins can create/update/delete users
      allow create, update, delete: if hasRole('admin');

      // Admins can read all users
      allow read: if hasRole('admin');
    }

    // Incidents collection
    match /incidents/{incidentId} {
      // Anyone authenticated can read incidents
      allow read: if isSignedIn();

      // Citizens and agencies can create incidents
      allow create: if isSignedIn();

      // Agencies and admins can update incident status
      allow update: if hasRole('agency') || hasRole('admin');

      // Only admins can delete incidents
      allow delete: if hasRole('admin');
    }
  }
}
```

## Storage Security Rules

Update your `storage.rules` file:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /incidents/{incidentId}/{allPaths=**} {
      // Allow authenticated users to upload
      allow write: if request.auth != null;

      // Allow authenticated users to read
      allow read: if request.auth != null;
    }
  }
}
```
