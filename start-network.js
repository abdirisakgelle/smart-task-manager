const { exec } = require('child_process');
const os = require('os');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

console.log('🚀 Starting Smart Task Manager for Network Access...');
console.log('');
console.log(`📍 Your local IP address: ${localIP}`);
console.log(`🎯 Allowed IP: 192.168.18.28`);
console.log('');
console.log('📱 Access URLs:');
console.log(`   Local: http://localhost:5173`);
console.log(`   Network: http://${localIP}:5173`);
console.log(`   Specific IP: http://192.168.18.28:5173`);
console.log('');
console.log('⚠️  Make sure to:');
console.log('   1. Start the backend server first: cd server && npm start');
console.log('   2. Start the frontend: cd client && npm run dev');
console.log('   3. Access from 192.168.18.28 using the network URL above');
console.log(''); 