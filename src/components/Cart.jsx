import React from 'react';
import './Cart.css';

export default function Cart({ cartItems, onBack, onConfirm }) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-container animate-fade-in">
      <header className="cart-header">
        <button className="back-btn" onClick={onBack}>&larr; Back to Menu</button>
        <h2>Your Order</h2>
      </header>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your order is currently empty.</p>
          <button className="gold-btn" onClick={onBack}>Browse Menu</button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="cart-item-qty">Qty: {item.quantity}</p>
                </div>
                <div className="cart-item-price">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row total-row" style={{ marginTop: 0, borderTop: 'none', paddingTop: 0 }}>
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            
            <button className="confirm-btn" onClick={onConfirm}>Confirm & Place Order</button>
          </div>
        </div>
      )}
    </div>
  );
}
