import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBjaJLkSl0ymTGjdkBihPY2NOw5A7VL4WU",
  authDomain: "room-food-9cb38.firebaseapp.com",
  databaseURL: "https://room-food-9cb38-default-rtdb.firebaseio.com",
  projectId: "room-food-9cb38",
  storageBucket: "room-food-9cb38.firebasestorage.app",
  messagingSenderId: "516119111602",
  appId: "1:516119111602:web:c808fbcc914c52f49a26ab"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
