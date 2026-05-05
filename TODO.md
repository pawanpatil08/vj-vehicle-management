# Firebase Migration for Residents Data - Bulk Upload & Switch from JSON

## Steps:

- [ ] 1. Complete firebase-data.service.ts: Add missing imports (updateDoc, setDoc), implement updateResident fully
- [ ] 2. Create bulk-upload.ts: Script to load residents.json, upload to Firestore 'residents' (strip id/_all, add createdAt)
- [ ] 2.1 Install @types/node tsx, run npx tsx src/app/bulk-upload.ts
- [x] 3. Update data.service.ts: Inject FirebaseDataService, replace load()/CRUD with Firebase methods, compute _all client-side
- [ ] 4. Run bulk upload (node/tsx script)
- [ ] 5. Test: ng serve, verify data from Firebase, search/CRUD work, admin ops
- [ ] 6. Cleanup: Remove/comment JSON load, add realtime onSnapshot for live sync
- [ ] 7. Complete task

Current: Step 1 in progress.
