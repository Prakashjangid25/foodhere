import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const menuData = JSON.parse(readFileSync(join(__dirname, 'server', 'data', 'menu.json'), 'utf8'));
const menuStr = JSON.stringify(menuData, null, 2);

const seedContent = `import React, { useState } from 'react';
import { db } from './config';
import { doc, setDoc } from 'firebase/firestore';

const menuData = ${menuStr};

export default function SeedFirestore() {
  const [status, setStatus] = useState('Ready to seed');
  const [done, setDone] = useState(false);

  const seed = async () => {
    setStatus('Seeding...');
    try {
      for (const category of menuData) {
        await setDoc(doc(db, 'menu', category.id), {
          name: category.name,
          items: category.items
        });
        setStatus('Seeded: ' + category.name);
      }
      setStatus('All data seeded successfully!');
      setDone(true);
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h2 style={{ color: '#cfa858', marginBottom: 20 }}>Firestore Seeder</h2>
      <p style={{ marginBottom: 30, fontSize: '1.1rem' }}>{status}</p>
      {!done && <button onClick={seed} style={{ padding: '15px 30px', fontSize: '1.1rem', background: '#cfa858', color: '#0a0a10', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Seed Menu Data to Firestore</button>}
      {done && <p style={{ color: '#2ecc71', marginTop: 20 }}>You can now remove SeedFirestore from App.jsx</p>}
    </div>
  );
}
`;

writeFileSync(join(__dirname, 'src', 'firebase', 'SeedFirestore.jsx'), seedContent);
console.log('SeedFirestore.jsx created with menu data');
