import { initializeApp, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, limit } from "firebase/firestore";
const fs = require('fs');
const path = require('path');

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
  const jsonPath = path.join(__dirname, 'public', 'residents.json');
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
    console.log(`Uploaded ${count}: ${resident.flatNumber}`);
  }
  console.log('Upload complete!');
}

main().catch(console.error);
