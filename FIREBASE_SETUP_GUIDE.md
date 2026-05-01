# Firebase Authentication & Role-Based Access Control Setup Guide

## Overview
This application now includes Firebase authentication with role-based access control (RBAC). Users can register and login with different roles (Supervisor, Admin, Data Management) that determine their permissions.

## Features Implemented

### 1. **Authentication System**
- User registration with email/password
- User login with Firebase Auth
- Session persistence
- Logout functionality
- Role assignment during registration

### 2. **Role-Based Access Control**

#### **Supervisor Role**
- ✅ View and search vehicle registry
- ✅ Filter data by criteria
- ✅ View detailed information
- ❌ Cannot edit entries
- ❌ Cannot add entries
- ❌ Cannot delete entries
- ❌ Cannot access admin panel

#### **Admin Role**
- ✅ Full access to all features
- ✅ Add new entries
- ✅ Edit existing entries
- ✅ Delete entries
- ✅ Access admin panel
- ✅ Manage registry

#### **Data Management Role**
- ✅ Add new entries
- ✅ Edit existing entries
- ✅ Delete entries
- ✅ Access admin panel
- ❌ Cannot perform system-wide operations (restricted to admin)

### 3. **Firebase Integration**
- Authentication via Firebase Auth
- User data stored in Firestore
- CSV data can be imported to Firebase
- Real-time database synchronization

### 4. **Security Guards**
- Route protection with `authGuard`
- Role-based route protection with `roleGuard`
- Automatic redirect to login for unauthenticated users
- Unauthorized access prevention

## Installation & Setup

### Step 1: Install Firebase SDK
```bash
npm install firebase
```

### Step 2: Project Structure
```
src/app/
├── model/
│   ├── resident.model.ts
│   └── user.model.ts (NEW)
├── services/
│   ├── auth.service.ts (NEW)
│   ├── auth.guard.ts (NEW)
│   ├── firebase-data.service.ts (NEW)
│   └── data.service.ts (UPDATED)
├── pages/components/
│   ├── login/ (NEW)
│   │   ├── login.ts
│   │   ├── login.html
│   │   └── login.scss
│   ├── register/ (NEW)
│   │   ├── register.ts
│   │   ├── register.html
│   │   └── register.scss
│   ├── search/ (UPDATED)
│   ├── admin/ (UPDATED)
├── firebase.config.ts (UPDATED)
├── app.routes.ts (UPDATED)
├── app.config.ts (UPDATED)
├── app.ts (UPDATED)
├── app.html (UPDATED)
└── app.scss (UPDATED)
```

### Step 3: File Descriptions

#### **Services**
- **auth.service.ts**: Handles Firebase authentication, user registration, login, logout, and role management
- **auth.guard.ts**: Route guards for protecting pages based on authentication and roles
- **firebase-data.service.ts**: Manages Firestore operations for residents data

#### **Models**
- **user.model.ts**: User and AuthState interfaces with role types

#### **Components**
- **login/**: Login page component with email/password form
- **register/**: Registration page with role selection
- **search/**: Updated to check user permissions
- **admin/**: Updated to work with role-based access

## Usage Guide

### For Users

#### Registration
1. Navigate to `/register`
2. Fill in the registration form:
   - Full Name
   - Email
   - Password (minimum 6 characters)
   - Select Role (Supervisor, Admin, or Data Management)
3. Click "Create Account"
4. You'll be redirected to the search page

#### Login
1. Navigate to `/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the search page

#### Based on Your Role

**Supervisor:**
- Click the "search" tab to view the registry
- Use the search bar to find entries
- Filter results by flat, vehicle, or mobile number
- Click on entries to view details
- Admin tab will be disabled

**Admin / Data Management:**
- Access both Search and Admin tabs
- Use Admin tab to:
  - Add new entries
  - Edit existing entries
  - Delete entries
  - Filter entries in the admin list

### For Developers

#### Using AuthService in Components

```typescript
import { AuthService } from './services/auth.service';

export class MyComponent {
  authService = inject(AuthService);

  // Check if user is authenticated
  if (this.authService.isAuthenticated()) {
    // User is logged in
  }

  // Get current user
  const user = this.authService.getCurrentUser();
  console.log(user?.email, user?.role);

  // Check if user has specific roles
  if (this.authService.hasRole('admin', 'datamanagement')) {
    // User is admin or data management
  }

  // Check if user can edit
  if (this.authService.canEdit()) {
    // Show edit buttons
  }

  // Register new user
  await this.authService.register(
    'user@example.com',
    'password123',
    'John Doe',
    'supervisor'
  );

  // Login
  await this.authService.login('user@example.com', 'password123');

  // Logout
  await this.authService.logout();
}
```

#### Using AuthGuard in Routes

```typescript
import { authGuard, roleGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [authGuard], // Requires authentication
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [roleGuard(['admin', 'datamanagement'])], // Requires admin or datamanagement role
  },
];
```

#### Accessing Firestore Data

```typescript
import { FirebaseDataService } from './services/firebase-data.service';

export class MyComponent {
  firebaseDataService = inject(FirebaseDataService);

  async loadResidents() {
    const residents = await this.firebaseDataService.getResidents();
    console.log(residents);
  }

  async addResident(resident: Resident) {
    const id = await this.firebaseDataService.addResident(resident);
    console.log('Added resident with ID:', id);
  }

  async deleteResident(id: string) {
    await this.firebaseDataService.deleteResident(id);
  }
}
```

## Test Accounts

For testing, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Supervisor | supervisor@test.com | test123 |
| Admin | admin@test.com | test123 |
| Data Management | datamgmt@test.com | test123 |

## Firebase Console Setup

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **vj-vehicle-management**
3. Go to **Authentication** → Enable **Email/Password** provider
4. Go to **Firestore Database** → Create database with these collections:
   - **users**: Stores user profiles with role information
   - **residents**: Stores vehicle registry entries (optional, for CSV import)

## Uploading CSV Data to Firebase

To upload existing CSV data to Firestore:

```typescript
import { FirebaseDataService } from './services/firebase-data.service';
import { DataService } from './services/data.service';

export class CsvUploadComponent {
  firebaseDataService = inject(FirebaseDataService);
  dataService = inject(DataService);

  async uploadCsvData() {
    // Get residents from CSV (already parsed by DataService)
    const residents = this.dataService.residents();

    // Upload to Firebase
    await this.firebaseDataService.uploadResidents(residents);
    console.log('CSV data uploaded to Firebase!');
  }
}
```

## Styling

All new components follow the existing design system using CSS custom properties:
- `--accent`: Orange/accent color
- `--paper`: Background for cards
- `--ink`: Text color
- `--line`: Border color
- `--muted`: Muted text color
- And more...

The login and register pages match the styling of existing search and admin components.

## Environment Variables

Add these to your `.env` file (if you're using one):
```
FIREBASE_API_KEY=AIzaSyC-LmPOZevE9E1xKD-Goat_wPHznTv8f58
FIREBASE_AUTH_DOMAIN=vj-vehicle-management.firebaseapp.com
FIREBASE_PROJECT_ID=vj-vehicle-management
FIREBASE_STORAGE_BUCKET=vj-vehicle-management.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=825360428563
FIREBASE_APP_ID=1:825360428563:web:482b89f8571429e18819e6
```

## Troubleshooting

### Firebase Module Not Found
- Make sure you've run `npm install firebase`
- Check that Firebase is imported in `app.config.ts`

### Authentication Not Working
- Verify Firebase credentials in `firebase.config.ts`
- Check Firebase Console for Email/Password provider enabled
- Clear browser cache and local storage

### Users Can't Access Admin
- Verify the user's role in Firestore console
- Check that `roleGuard` is applied to admin route
- Make sure user is assigned 'admin' or 'datamanagement' role during registration

### Routes Not Working
- Ensure routes are imported in `app.routes.ts`
- Check that components are standalone
- Verify `RouterModule` is imported in relevant components

## Next Steps

1. **Test Authentication**:
   - Register a new user
   - Login with the new account
   - Verify role-based access

2. **Import CSV Data**:
   - Create a component or service to upload CSV to Firestore
   - Modify the data service to fetch from Firestore instead of local CSV

3. **Enhanced Features** (Future):
   - User profile management
   - Password reset functionality
   - Two-factor authentication
   - Audit logging
   - Role management interface
   - Bulk data import tools

## Support

For Firebase documentation, visit:
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
