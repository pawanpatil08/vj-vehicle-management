import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, getDocs, limit } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyC-LmPOZevE9E1xKD-Goat_wPHznTv8f58",
  authDomain: "vj-vehicle-management.firebaseapp.com",
  projectId: "vj-vehicle-management",
  storageBucket: "vj-vehicle-management.firebasestorage.app",
  messagingSenderId: "825360428563",
  appId: "1:825360428563:web:482b89f8571429e18819e6",
  measurementId: "G-3BM5MJK1WE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const jsonPath = path.join(process.cwd(), 'public', 'residents.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const residents = JSON.parse(raw);

  console.log(`Loaded ${residents.length} residents`);

  const residentsCollection = collection(db, 'residents');
  const q = query(residentsCollection, limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.size > 0) {
    console.log('Collection not empty. Skipping.');
    return;
  }

  console.log('Uploading...');
  let count = 0;
  for (const resident of residents) {
    const clean = { ...resident };
    delete clean.id;
    delete clean._all;
    clean.createdAt = new Date().toISOString();
    
    await addDoc(residentsCollection, clean);
    count++;
    if (count % 10 === 0) console.log(`Uploaded ${count}/${residents.length}`);
  }
  console.log(`Upload complete! ${count} residents.`);
}

main().catch(console.error);
