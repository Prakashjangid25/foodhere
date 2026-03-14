import React from 'react';
import './OrderSuccess.css';

export default function OrderSuccess({ room, guest, onNewOrder }) {
  return (
    <div className="success-container animate-fade-in">
      <div className="success-card">
        <div className="icon-wrapper">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        
        <h2 className="success-title">Order Confirmed</h2>
        <p className="success-msg">
          Thank you, {guest}. Your exquisite dining experience is being prepared by our executive chef.
        </p>
        <p className="success-details">
          It will be delivered to <strong>Room {room}</strong> within 30-45 minutes.
        </p>
        
        <button className="new-order-btn" onClick={onNewOrder}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}
