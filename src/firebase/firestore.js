import { db } from './config';
import {
  ref, get, set, push, update, remove,
  onValue, query, orderByChild
} from 'firebase/database';

// ========= MENU =========
export async function getMenu() {
  const snap = await get(ref(db, 'menu'));
  if (snap.exists()) {
    const data = snap.val();
    // Convert object to array
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
  }
  return [];
}

export function onMenuChange(callback) {
  const menuRef = ref(db, 'menu');
  return onValue(menuRef, (snap) => {
    if (snap.exists()) {
      const data = snap.val();
      const menu = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      callback(menu);
    } else {
      callback([]);
    }
  });
}

export async function updateMenuItem(categoryId, itemId, updatedItem) {
  const snap = await get(ref(db, `menu/${categoryId}/items`));
  if (snap.exists()) {
    const items = snap.val();
    const idx = items.findIndex(i => i.id === itemId);
    if (idx > -1) {
      items[idx] = { ...items[idx], ...updatedItem };
      await set(ref(db, `menu/${categoryId}/items`), items);
    }
  }
}

export async function addMenuItem(categoryId, newItem) {
  const snap = await get(ref(db, `menu/${categoryId}/items`));
  const items = snap.exists() ? snap.val() : [];
  const itemWithId = { ...newItem, id: 'item_' + Date.now() };
  items.push(itemWithId);
  await set(ref(db, `menu/${categoryId}/items`), items);
}

export async function deleteMenuItem(categoryId, itemId) {
  const snap = await get(ref(db, `menu/${categoryId}/items`));
  if (snap.exists()) {
    const items = snap.val().filter(i => i.id !== itemId);
    await set(ref(db, `menu/${categoryId}/items`), items);
  }
}

// ========= ORDERS =========
export async function createOrder(orderData) {
  const orderRef = push(ref(db, 'orders'));
  const order = {
    ...orderData,
    status: 'received',
    createdAt: Date.now(),
    adminNotified: false
  };
  await set(orderRef, order);
  return { id: orderRef.key, ...order };
}

export function onOrdersChange(callback) {
  const ordersRef = ref(db, 'orders');
  return onValue(ordersRef, (snap) => {
    if (snap.exists()) {
      const data = snap.val();
      const orders = Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(orders);
    } else {
      callback([]);
    }
  });
}

export async function updateOrderStatus(orderId, newStatus) {
  await update(ref(db, `orders/${orderId}`), { status: newStatus });
}

export async function markOrderNotified(orderId) {
  await update(ref(db, `orders/${orderId}`), { adminNotified: true });
}

// ========= SEED MENU DATA =========
export async function seedMenuData(menuData) {
  const menuObj = {};
  menuData.forEach(cat => {
    menuObj[cat.id] = {
      name: cat.name,
      items: cat.items
    };
  });
  await set(ref(db, 'menu'), menuObj);
}
