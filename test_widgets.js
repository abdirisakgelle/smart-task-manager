const fetch = require('node-fetch');

async function testWidgets() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1wbG95ZWVfaWQiOm51bGwsInR5cGUiOiJhZG1pbiIsImlhdCI6MTc1NDMwODc5NSwiZXhwIjoxNzU0MzEyMzk1LCJhdWQiOiJzbWFydC10YXNrLW1hbmFnZXItdXNlcnMiLCJpc3MiOiJzbWFydC10YXNrLW1hbmFnZXIifQ.L61prrcS17lCruqiSpTFy5A-1wyt3n5i6EkQFpdrAxU';
    
    const response = await fetch('http://localhost:3000/api/dashboard/admin', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('=== Top Contributors ===');
    console.log(JSON.stringify(data.data.widgets.top_contributors, null, 2));
    
    console.log('\n=== Best Performers ===');
    console.log(JSON.stringify(data.data.widgets.best_performers, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testWidgets(); 