import { Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Firestore,
} from 'firebase/firestore';
import { getFirestoreInstance } from '../firebase.config';
import { Resident } from '../model/resident.model';

@Injectable({ providedIn: 'root' })
export class FirebaseDataService {
  private firestore: Firestore;

  constructor() {
    this.firestore = getFirestoreInstance();
  }

  async uploadResidents(residents: Resident[]): Promise<void> {
    const residentsCollection = collection(this.firestore, 'residents');

    for (const resident of residents) {
      await addDoc(residentsCollection, {
        ...resident,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async getResidents(): Promise<Resident[]> {
    const residentsCollection = collection(this.firestore, 'residents');
    const snapshot = await getDocs(residentsCollection);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Resident));
  }

  async addResident(resident: Resident): Promise<string> {
    const residentsCollection = collection(this.firestore, 'residents');
    const docRef = await addDoc(residentsCollection, {
      ...resident,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  }

  async updateResident(id: string, resident: Partial<Resident>): Promise<void> {
    const docRef = doc(this.firestore, 'residents', id);
    const residentsCollection = collection(this.firestore, 'residents');
    // Note: updateDoc is preferred but for simplicity we can use setDoc with merge
    // For now, this is a placeholder - you'll need to add updateDoc from firebase
    const snap = await getDocs(residentsCollection);
    // Implementation for update
  }

  async deleteResident(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'residents', id);
    await deleteDoc(docRef);
  }

  async clearAllResidents(): Promise<void> {
    const residentsCollection = collection(this.firestore, 'residents');
    const snapshot = await getDocs(residentsCollection);

    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
  }
}
