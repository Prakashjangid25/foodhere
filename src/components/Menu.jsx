import React from 'react';
import './Menu.css';

export default function Menu({ menuData, addToCart, cartCount, onCheckout }) {
  return (
    <div className="menu-container animate-fade-in">
      <header className="menu-header">
        <div>
          <h2>In-Room Dining</h2>
        </div>
        <button className="cart-btn" onClick={onCheckout}>
          View Order ({cartCount})
        </button>
      </header>

      <div className="menu-content">
        {menuData.map(category => (
          <section key={category.id} className="menu-category">
            <h3 className="category-title">{category.name}</h3>
            <div className="items-grid">
              {category.items.map(item => (
                <div key={item.id} className="menu-item-card">
                  <div className="item-image" style={{ backgroundImage: `url(${item.image})` }}></div>
                  <div className="item-details">
                    <div className="item-header">
                      <h4>{item.name}</h4>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                    <p className="item-desc">{item.description}</p>
                    <button className="add-btn" onClick={() => addToCart(item)}>
                      + Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
