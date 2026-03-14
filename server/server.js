const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./data/db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// --- MENU ROUTES ---
app.get('/api/menu', (req, res) => {
  res.json(db.getMenu());
});

app.put('/api/menu/:categoryId/items/:itemId', (req, res) => {
  const { categoryId, itemId } = req.params;
  const updatedItem = req.body;
  const menu = db.getMenu();

  const catIndex = menu.findIndex(c => c.id === categoryId);
  if (catIndex > -1) {
    const itemIndex = menu[catIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
      menu[catIndex].items[itemIndex] = { ...menu[catIndex].items[itemIndex], ...updatedItem };
      db.setMenu(menu);
      io.emit('menuUpdated', menu);
      return res.json({ success: true, item: menu[catIndex].items[itemIndex] });
    }
  }
  res.status(404).json({ error: 'Item not found' });
});

app.post('/api/menu/:categoryId/items', (req, res) => {
  const { categoryId } = req.params;
  const newItem = {
    id: `item_${Date.now()}`,
    ...req.body
  };
  const menu = db.getMenu();
  
  const catIndex = menu.findIndex(c => c.id === categoryId);
  if (catIndex > -1) {
    menu[catIndex].items.push(newItem);
    db.setMenu(menu);
    io.emit('menuUpdated', menu);
    return res.status(201).json({ success: true, item: newItem });
  }
  res.status(404).json({ error: 'Category not found' });
});

app.delete('/api/menu/:categoryId/items/:itemId', (req, res) => {
  const { categoryId, itemId } = req.params;
  const menu = db.getMenu();
  
  const catIndex = menu.findIndex(c => c.id === categoryId);
  if (catIndex > -1) {
    const prevLength = menu[catIndex].items.length;
    menu[catIndex].items = menu[catIndex].items.filter(i => i.id !== itemId);
    
    if (menu[catIndex].items.length < prevLength) {
      db.setMenu(menu);
      io.emit('menuUpdated', menu);
      return res.json({ success: true });
    }
  }
  res.status(404).json({ error: 'Item not found' });
});

// --- ORDER ROUTES ---
app.get('/api/orders', (req, res) => {
  res.json(db.getOrders());
});

app.post('/api/orders', (req, res) => {
  const newOrder = {
    id: Date.now().toString(),
    ...req.body,
    status: 'received',
    timestamp: new Date().toISOString()
  };
  
  const orders = db.getOrders();
  orders.unshift(newOrder); // Add to beginning
  db.setOrders(orders);

  // Notify connected admin clients
  io.emit('newOrder', newOrder);

  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const orders = db.getOrders();
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex > -1) {
    orders[orderIndex].status = status;
    db.setOrders(orders);
    io.emit('orderUpdated', orders[orderIndex]);
    return res.json(orders[orderIndex]);
  }
  res.status(404).json({ error: 'Order not found' });
});

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
