import admin from 'firebase-admin';
import {config} from '../../firebase-config.js';

admin.initializeApp({
  credential: admin.credential.cert(config),
});

const db = admin.firestore();

export default db;
