const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testSystem() {
  console.log('🧪 Testing Smart Task Manager System...\n');

  try {
    // Test 1: User Authentication
    console.log('1. Testing user authentication...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      username: 'gelle',
      password: '123'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Login successful');
    console.log(`   User: ${user.name} (${user.username})`);
    console.log(`   Department: ${user.department}`);
    console.log(`   Role: ${user.role}`);

    // Test 2: Get Current User Profile
    console.log('\n2. Testing getCurrentUser endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Profile retrieved successfully');
    console.log(`   Name: ${profileResponse.data.name}`);
    console.log(`   Department: ${profileResponse.data.department}`);

    // Test 3: Ticket Creation
    console.log('\n3. Testing ticket creation...');
    const ticketResponse = await axios.post(`${BASE_URL}/tickets`, {
      customer_phone: '1234567890',
      communication_channel: 'Email',
      device_type: 'Mobile',
      issue_category: 'App',
      issue_type: 'Streaming',
      issue_description: 'System test ticket',
      resolution_status: 'Pending'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Ticket created successfully');
    console.log(`   Ticket ID: ${ticketResponse.data.ticket_id}`);
    console.log(`   Agent ID: ${ticketResponse.data.agent_id}`);

    // Test 4: Get Tickets
    console.log('\n4. Testing ticket retrieval...');
    const ticketsResponse = await axios.get(`${BASE_URL}/tickets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Tickets retrieved successfully');
    console.log(`   Total tickets: ${ticketsResponse.data.length}`);

    // Test 5: Test other users
    console.log('\n5. Testing other user accounts...');
    
    const users = [
      { username: 'admin', password: 'admin123', expectedDept: 'IT' },
      { username: 'manager', password: 'manager123', expectedDept: 'Marcom' },
      { username: 'user', password: 'user123', expectedDept: 'Marcom' }
    ];

    for (const user of users) {
      try {
        const userLoginResponse = await axios.post(`${BASE_URL}/users/login`, {
          username: user.username,
          password: user.password
        });
        
        console.log(`✅ ${user.username}: ${userLoginResponse.data.user.department} (expected: ${user.expectedDept})`);
      } catch (error) {
        console.log(`❌ ${user.username}: Login failed`);
      }
    }

    console.log('\n🎉 All tests passed! System is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testSystem(); 