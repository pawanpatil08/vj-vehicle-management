import { Injectable, signal } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import { User, UserRole, AuthState } from '../model/user.model';
import { getAuthInstance, getFirestoreInstance } from '../firebase.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth;
  private firestore: Firestore;

  authState = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  constructor() {
    this.auth = getAuthInstance();
    this.firestore = getFirestoreInstance();
    this.initAuthStateListener();
  }

  private async ensureUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const userRef = doc(this.firestore, 'users', firebaseUser.uid);
    
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: (userData['name'] as string) || '',
          role: (userData['role'] as UserRole) || 'supervisor',
          createdAt: new Date(userData['createdAt']),
          wing: (userData['wing'] as string) || '',
        };
      }
    } catch (error) {
      console.warn('Unable to read user profile from Firestore:', error);
    }

    const fallback: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || '',
      role: 'supervisor',
      wing: '',
      createdAt: new Date(),
    };

    try {
      await setDoc(userRef, {
        ...fallback,
        createdAt: fallback.createdAt.toISOString(),
      }, { merge: true });
    } catch (error) {
      console.warn('Unable to create missing user profile document:', error);
    }

    return fallback;
  }

  private initAuthStateListener(): void {
    onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const user = await this.ensureUserProfile(firebaseUser);
          this.authState.set({
            user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Still mark as authenticated even if profile load fails
          const fallbackUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            role: 'supervisor',
            wing: '',
            createdAt: new Date(),
          };
          this.authState.set({
            user: fallbackUser,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        }
      } else {
        this.authState.set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      }
    });
  }

  async register(
    email: string,
    password: string,
    name: string,
    wing: string,
    role: UserRole = 'supervisor'
  ): Promise<void> {
    try {
      this.authState.update((state) => ({ ...state, loading: true, error: null }));

      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const user: User = {
        id: userCredential.user.uid,
        email,
        name,
        wing,
        role,
        createdAt: new Date(),
      };

      await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
        ...user,
        createdAt: user.createdAt.toISOString(),
      });

      this.authState.update((state) => ({
        ...state,
        user,
        isAuthenticated: true,
        loading: false,
      }));
    } catch (error: any) {
      const message =
        error.code === 'permission-denied'
          ? 'Firestore permission denied. Verify your Firestore security rules and allow authenticated user writes to /users/{uid}.'
          : error.message || 'Registration failed';

      this.authState.update((state) => ({
        ...state,
        loading: false,
        error: message,
      }));
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      this.authState.update((state) => ({ ...state, loading: true, error: null }));

      await signInWithEmailAndPassword(this.auth, email, password);
      this.authState.update((state) => ({
        ...state,
        isAuthenticated: true,
        loading: false,
      }));
    } catch (error: any) {
      this.authState.update((state) => ({
        ...state,
        isAuthenticated: false,
        loading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.authState.set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      this.authState.update((state) => ({
        ...state,
        error: error.message || 'Logout failed',
      }));
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.authState().user;
  }

  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  hasRole(...roles: UserRole[]): boolean {
    const currentRole = this.authState().user?.role;
    return currentRole ? roles.includes(currentRole) : false;
  }

  canEdit(): boolean {
    return this.hasRole('admin', 'datamanagement');
  }

  canSearch(): boolean {
    return this.isAuthenticated();
  }
}
