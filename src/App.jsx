import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoomLogin from './components/RoomLogin';
import Menu from './components/Menu';
import Cart from './components/Cart';
import OrderSuccess from './components/OrderSuccess';
import AdminDashboard from './components/AdminDashboard';
import { getMenu, createOrder, seedMenuData } from './firebase/firestore';

// Initial menu data for seeding (loaded from server/data/menu.json via build step)
import menuSeedData from './firebase/menuSeed.json';

function GuestApp() {
  const [view, setView] = useState(() => {
    return localStorage.getItem('appView') || 'login';
  });
  const [guestDetails, setGuestDetails] = useState(() => {
    const saved = localStorage.getItem('guestDetails');
    return saved ? JSON.parse(saved) : { room: '', name: '' };
  });
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenu()
      .then(data => {
        if (data.length === 0) {
          // Auto-seed if database is empty
          return seedMenuData(menuSeedData).then(() => getMenu());
        }
        return data;
      })
      .then(data => {
        setMenuData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load menu", err);
        setLoading(false);
      });
  }, []);

  const handleLogin = (room, name) => {
    const details = { room, name };
    setGuestDetails(details);
    localStorage.setItem('guestDetails', JSON.stringify(details));
    updateView('menu');
  };

  const updateView = (newView) => {
    setView(newView);
    localStorage.setItem('appView', newView);
  };

  const handleAddToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      let newCart;
      if (existing) {
        newCart = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newCart = [...prev, { ...item, quantity: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleCheckout = () => {
    updateView('cart');
  };

  const handleConfirmOrder = () => {
    const orderData = {
      guestName: guestDetails.name,
      roomNumber: guestDetails.room,
      items: cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    createOrder(orderData)
      .then(() => {
        updateView('success');
      })
      .catch(err => {
        console.error("Order failed", err);
        alert("There was an issue processing your order. Please call reception.");
      });
  };

  const handleNewOrder = () => {
    setCart([]);
    localStorage.setItem('cart', JSON.stringify([]));
    updateView('menu');
  };

  if (loading) {
    return (
      <div className="global-loader">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      {view === 'login' && <RoomLogin onLogin={handleLogin} />}
      
      {view === 'menu' && (
        <Menu 
          menuData={menuData}
          addToCart={handleAddToCart} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onCheckout={handleCheckout} 
        />
      )}

      {view === 'cart' && (
        <Cart 
          cartItems={cart} 
          onBack={() => setView('menu')} 
          onConfirm={handleConfirmOrder} 
        />
      )}

      {view === 'success' && (
        <OrderSuccess 
          room={guestDetails.room} 
          guest={guestDetails.name} 
          onNewOrder={handleNewOrder} 
        />
      )}
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/*" element={<GuestApp />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
