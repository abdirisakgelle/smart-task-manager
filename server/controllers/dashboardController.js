const pool = require('../config/db');

// Dashboard daily stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Total tickets today
    const [tickets] = await pool.query(
      "SELECT COUNT(*) as total, SUM(resolution_status = 'resolved') as resolved, AVG(TIMESTAMPDIFF(SECOND, created_at, end_time)) as avg_handle_time FROM tickets WHERE DATE(created_at) = CURDATE()"
    );

    // Total content today
    const [contents] = await pool.query(
      "SELECT COUNT(*) as total, SUM(script_status = 'done') as done FROM content WHERE DATE(created_at) = CURDATE()"
    );

    // Total posts today
    const [posts] = await pool.query(
      "SELECT COUNT(*) as total, SUM(status = 'done') as done FROM social_media WHERE DATE(post_date) = CURDATE()"
    );

    res.json({
      tickets: {
        total: tickets[0].total,
        resolved: tickets[0].resolved,
        resolvedPercent: tickets[0].total ? Math.round((tickets[0].resolved / tickets[0].total) * 100) : 0,
        avgHandleTimeSeconds: tickets[0].avg_handle_time || 0,
      },
      contents: {
        total: contents[0].total,
        done: contents[0].done,
        donePercent: contents[0].total ? Math.round((contents[0].done / contents[0].total) * 100) : 0,
      },
      posts: {
        total: posts[0].total,
        done: posts[0].done,
        donePercent: posts[0].total ? Math.round((posts[0].done / posts[0].total) * 100) : 0,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 