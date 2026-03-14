import React, { useState } from 'react';
import './RoomLogin.css';

export default function RoomLogin({ onLogin }) {
  const [room, setRoom] = useState('');
  const [guest, setGuest] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (room.trim() && guest.trim()) {
      onLogin(room, guest);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card">
        <h1 className="hotel-title">The Grand Continental</h1>
        <p className="subtitle">In-Room Dining Experience</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Guest Name</label>
            <input 
              type="text" 
              placeholder="Enter your name" 
              value={guest} 
              onChange={(e) => setGuest(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label>Room Number</label>
            <input 
              type="text" 
              placeholder="e.g. 402" 
              value={room} 
              onChange={(e) => setRoom(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="login-btn">Unlock Menu</button>
        </form>
      </div>
    </div>
  );
}
