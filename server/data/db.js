const fs = require('fs');
const path = require('path');

const menuDataPath = path.join(__dirname, 'menu.json');
const ordersDataPath = path.join(__dirname, 'orders.json');

// Helper to read data
function readData(filePath, defaultData) {
  try {
    if (!fs.existsSync(filePath)) {
      writeData(filePath, defaultData);
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultData;
  }
}

// Helper to write data
function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

module.exports = {
  getMenu: () => readData(menuDataPath, []),
  setMenu: (data) => writeData(menuDataPath, data),
  getOrders: () => readData(ordersDataPath, []),
  setOrders: (data) => writeData(ordersDataPath, data)
};
