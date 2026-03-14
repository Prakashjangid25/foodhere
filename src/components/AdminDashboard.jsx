import React, { useState, useEffect } from 'react';
import {
  onMenuChange, onOrdersChange,
  updateMenuItem, addMenuItem, deleteMenuItem,
  updateOrderStatus
} from '../firebase/firestore';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  
  // Persist tab via URL hash
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    return hash === 'menu' ? 'menu' : 'orders';
  };
  const [tab, setTab] = useState(getInitialTab);

  useEffect(() => {
    window.location.hash = tab;
  }, [tab]);
  
  // Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Real-time Firestore listeners
  useEffect(() => {
    const unsubMenu = onMenuChange(setMenu);
    const unsubOrders = onOrdersChange(setOrders);
    return () => {
      unsubMenu();
      unsubOrders();
    };
  }, []);

  const handleUpdateStatus = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const openEditModal = (categoryId, item) => {
    setEditingItem({ categoryId, item: { ...item } });
  };

  const closeEditModal = () => {
    setEditingItem(null);
  };

  const handleModalChange = (field, value) => {
    setEditingItem(prev => ({
      ...prev,
      item: { ...prev.item, [field]: value }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleModalChange('image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEditModal = async () => {
    const { categoryId, item } = editingItem;
    const payload = { ...item, price: Number(item.price) };

    try {
      if (item.id) {
        await updateMenuItem(categoryId, item.id, payload);
      } else {
        await addMenuItem(categoryId, payload);
      }
      closeEditModal();
    } catch (err) {
      console.error("Failed to save item", err);
      alert("Failed to save item.");
    }
  };

  const handleAddItem = (categoryId) => {
    setEditingItem({ categoryId, item: { name: '', price: 0, description: '', image: '' } });
  };

  const handleDeleteItem = (categoryId, itemId, itemName) => {
    setDeletingItem({ categoryId, itemId, itemName });
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    const { categoryId, itemId } = deletingItem;
    setDeletingItem(null);

    try {
      await deleteMenuItem(categoryId, itemId);
    } catch (err) {
      console.error('DELETE error:', err);
    }
  };

  const cancelDelete = () => {
    setDeletingItem(null);
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>Grand Admin</h2>
          <p className="brand-subtitle">5-Star Management</p>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
            <span className="nav-icon">📦</span> Live Orders
          </button>
          <button className={`nav-btn ${tab === 'menu' ? 'active' : ''}`} onClick={() => setTab('menu')}>
            <span className="nav-icon">🍽️</span> Menu Manager
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h1>{tab === 'orders' ? 'Live Orders Overview' : 'Menu Manager'}</h1>
          <div className="topbar-profile">
            <div className="profile-avatar">A</div>
            <span>Admin User</span>
          </div>
        </header>

        <div className="admin-content">
          {tab === 'orders' && (
            <div className="orders-view">
              {orders.length === 0 && <p className="text-muted">No orders currently active.</p>}
              <div className="orders-grid">
                {orders.map(order => (
                  <div key={order.id} className={`order-card status-${order.status}`}>
                    <div className="order-header">
                      <h3>Room {order.roomNumber}</h3>
                      <span className="order-status">{order.status}</span>
                    </div>
                    <p className="guest-name">Guest: {order.guestName}</p>
                    <ul className="order-items">
                      {order.items && order.items.map((item, idx) => (
                        <li key={idx}>{item.quantity}x {item.name}</li>
                      ))}
                    </ul>
                    <div className="order-footer">
                      <strong>Total: ₹{order.total ? order.total.toFixed(2) : '0.00'}</strong>
                      <div className="order-actions">
                        <button onClick={() => handleUpdateStatus(order.id, 'preparing')}>Prep</button>
                        <button onClick={() => handleUpdateStatus(order.id, 'delivered')}>Deliver</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'menu' && (
            <div className="menu-manager-view">
              {menu.map(category => (
                <div key={category.id} className="admin-category">
                  <div className="category-header">
                    <h3>{category.name}</h3>
                    <button className="add-btn" onClick={() => handleAddItem(category.id)}>+ Add Item</button>
                  </div>
                  <div className="admin-items-grid">
                    {category.items && category.items.map(item => (
                      <div key={item.id} className="admin-item-card">
                        <img src={item.image} alt={item.name} className="admin-item-hero" />
                        <div className="admin-item-card-body">
                          <div className="admin-item-card-header">
                            <strong>{item.name}</strong>
                            <span className="price-tag">₹{item.price}</span>
                          </div>
                          <p className="item-desc-truncate">{item.description}</p>
                          <div className="item-card-actions">
                            <button className="edit-btn" onClick={() => openEditModal(category.id, item)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDeleteItem(category.id, item.id, item.name)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingItem.item.id ? 'Edit Item' : 'Add New Item'}</h3>
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                value={editingItem.item.name} 
                onChange={(e) => handleModalChange('name', e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input 
                type="number" 
                value={editingItem.item.price} 
                onChange={(e) => handleModalChange('price', e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={editingItem.item.description || ''} 
                onChange={(e) => handleModalChange('description', e.target.value)} 
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Update Image</label>
              <div className="image-upload-preview">
                {editingItem.item.image && (
                  <img src={editingItem.item.image} alt="Preview" className="modal-img-preview" />
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload} 
                  className="file-input"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeEditModal}>Cancel</button>
              <button className="save-btn" onClick={saveEditModal}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <div className="delete-icon">🗑️</div>
            <h3>Confirm Deletion</h3>
            <p className="delete-msg">Are you sure you want to remove <strong>"{deletingItem.itemName}"</strong> from the menu?</p>
            <p className="delete-warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={cancelDelete}>No, Keep It</button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
