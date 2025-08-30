import pool from '../config/db.js';

// Function to auto-insert tickets into supervisor reviews
const autoInsertTicketsToReviews = async () => {
  try {
    console.log('Running scheduled auto-insert check...');
    
    // Get tickets from last 3 days that are not done and not already in supervisor_reviews
    const [tickets] = await pool.query(`
      SELECT t.ticket_id 
      FROM tickets t 
      LEFT JOIN supervisor_reviews sr ON t.ticket_id = sr.ticket_id 
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 3 DAY)
        AND t.resolution_status != 'done' 
        AND t.resolution_status != 'Done'
        AND sr.review_id IS NULL
    `);

    if (tickets.length > 0) {
      // Insert these tickets into supervisor_reviews with default supervisor_id = 1
      const values = tickets.map(ticket => [ticket.ticket_id, 1, null, false, null]);
      await pool.query(
        'INSERT INTO supervisor_reviews (ticket_id, supervisor_id, issue_status, resolved, notes) VALUES ?',
        [values]
      );
      console.log(`Scheduled job: Auto-inserted ${tickets.length} tickets into supervisor reviews`);
    } else {
      console.log('Scheduled job: No new tickets to insert into supervisor reviews');
    }
  } catch (err) {
    console.error('Error in scheduled auto-insert tickets to reviews:', err);
  }
};

// Run the function immediately when this script is loaded
autoInsertTicketsToReviews();

// Export the function for use in other parts of the application
export { autoInsertTicketsToReviews }; 