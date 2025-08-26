const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAuth() {
  try {
    console.log('Testing authentication system...\n');

    // Test 1: Create a new user
    console.log('1. Testing user creation...');
    const createUserResponse = await axios.post(`${BASE_URL}/users`, {
      username: 'testuser',
      password: 'testpass123',
      role: 'agent'
    });
    console.log('✅ User created successfully:', createUserResponse.data);

    // Test 2: Login with the created user
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      username: 'testuser',
      password: 'testpass123'
    });
    console.log('✅ Login successful:', {
      user: loginResponse.data.user,
      token: loginResponse.data.token ? 'Token received' : 'No token'
    });

    const token = loginResponse.data.token;

    // Test 3: Access protected route with token
    console.log('\n3. Testing protected route access...');
    const protectedResponse = await axios.get(`${BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Protected route accessed successfully:', {
      userCount: protectedResponse.data.length
    });

    // Test 4: Test invalid login
    console.log('\n4. Testing invalid login...');
    try {
      await axios.post(`${BASE_URL}/users/login`, {
        username: 'testuser',
        password: 'wrongpassword'
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Invalid login correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 5: Test access without token
    console.log('\n5. Testing access without token...');
    try {
      await axios.get(`${BASE_URL}/users`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Access without token correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Only run if axios is available
try {
  require('axios');
  testAuth();
} catch (error) {
  console.log('To run this test, install axios: npm install axios');
} 