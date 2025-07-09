const pool = require('../config/db');

// Middleware to automatically insert tickets into supervisor reviews
const autoInsertReviewsMiddleware = async (req, res, next) => {
  // Store the original send method
  const originalSend = res.send;
  
  // Override the send method to intercept the response
  res.send = function(data) {
    // Call the original send method
    originalSend.call(this, data);
    
    // If this is a successful ticket creation, auto-insert into supervisor reviews
    if (req.method === 'POST' && req.path.includes('/tickets') && res.statusCode === 201) {
      try {
        const ticketData = JSON.parse(data);
        const ticketId = ticketData.ticket_id;
        
        // Check if ticket should be added to supervisor reviews
        // Only add if resolution_status is not 'done' and created in last 3 days
        if (ticketId && 
            ticketData.resolution_status !== 'done' && 
            ticketData.resolution_status !== 'Done') {
          
          // Insert into supervisor_reviews table
          pool.query(
            'INSERT INTO supervisor_reviews (ticket_id, supervisor_id, issue_status, resolved, notes) VALUES (?, ?, ?, ?, ?)',
            [ticketId, 1, null, false, null]
          ).then(() => {
            console.log(`Auto-inserted ticket ${ticketId} into supervisor reviews`);
          }).catch(err => {
            console.error('Error auto-inserting ticket to reviews:', err);
          });
        }
      } catch (err) {
        console.error('Error parsing ticket data for auto-insert:', err);
      }
    }
  };
  
  next();
};

module.exports = autoInsertReviewsMiddleware; 