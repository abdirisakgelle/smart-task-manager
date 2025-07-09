const pool = require('../config/db');
const moment = require('moment-timezone');

// Dashboard daily stats - simplified for today only
exports.getDashboardStats = async (req, res) => {
  try {
    // Total tickets today
    const [tickets] = await pool.query(
      "SELECT COUNT(*) as total, SUM(LOWER(resolution_status) = 'done') as done, AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_handle_time FROM tickets WHERE DATE(created_at) = CURDATE()"
    );

    // Total content today (content table doesn't have created_at, so we'll get all content)
    const [contents] = await pool.query(
      "SELECT COUNT(*) as total, SUM(script_status = 'done') as done FROM content"
    );

    // Total posts today
    const [posts] = await pool.query(
      "SELECT COUNT(*) as total, SUM(status = 'published') as published FROM social_media WHERE DATE(post_date) = CURDATE()"
    );

    res.json({
      tickets: {
        total: tickets[0].total || 0,
        done: tickets[0].done || 0,
        avgHandleTimeMinutes: Math.round(tickets[0].avg_handle_time || 0),
      },
      contents: {
        total: contents[0].total || 0,
        done: contents[0].done || 0,
      },
      posts: {
        total: posts[0].total || 0,
        published: posts[0].published || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin KPIs for Call Center and Digital Media - Today's Performance Only
exports.getAdminKPIs = async (req, res) => {
  try {
    // 1. Tickets Today & Done Count
    const [ticketsToday] = await pool.query(`
      SELECT COUNT(*) as total, SUM(LOWER(resolution_status) = 'done') as done
      FROM tickets WHERE DATE(created_at) = CURDATE()
    `);
    const ticketsTotal = ticketsToday[0].total || 0;
    const ticketsDone = ticketsToday[0].done || 0;

    // 2. Average Resolution Time (for tickets resolved today only)
    const [avgResTime] = await pool.query(`
      SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_minutes
      FROM tickets 
      WHERE DATE(created_at) = CURDATE() 
        AND LOWER(resolution_status) = 'done' 
        AND end_time IS NOT NULL
    `);
    const avgResolutionTime = Math.round(avgResTime[0].avg_minutes || 0);

    // 3. Escalation Rate (tickets escalated to supervisor reviews today)
    const [escalated] = await pool.query(`
      SELECT COUNT(DISTINCT t.ticket_id) as escalated
      FROM tickets t
      INNER JOIN supervisor_reviews sr ON t.ticket_id = sr.ticket_id
      WHERE DATE(t.created_at) = CURDATE()
    `);
    const escalationCount = escalated[0].escalated || 0;

    // 4. Reopened Tickets (tickets marked as Reopened today)
    const [reopened] = await pool.query(`
      SELECT COUNT(*) as total
      FROM tickets 
      WHERE DATE(created_at) = CURDATE() 
        AND resolution_status = 'Reopened'
    `);
    const reopenedTickets = reopened[0].total || 0;

    // 5. Customer Satisfaction (based on today's follow-up data)
    const [satisfaction] = await pool.query(`
      SELECT COUNT(*) as total, SUM(satisfied = 1) as satisfied
      FROM follow_ups 
      WHERE DATE(follow_up_date) = CURDATE() 
        AND satisfied IS NOT NULL
    `);
    const satisfactionTotal = satisfaction[0].total || 0;
    const satisfactionCount = satisfaction[0].satisfied || 0;
    const satisfactionRate = satisfactionTotal > 0 ? Math.round((satisfactionCount / satisfactionTotal) * 100) : 0;

    // 6. Ideas Executed (approved ideas submitted today)
    const [ideas] = await pool.query(`
      SELECT COUNT(*) as approved
      FROM ideas 
      WHERE DATE(submission_date) = CURDATE() 
        AND status = 'approved'
    `);
    const ideasExecuted = ideas[0].approved || 0;

    // 7. Content Produced (content marked completed today)
    const [content] = await pool.query(`
      SELECT COUNT(*) as completed
      FROM content 
      WHERE content_status = 'Completed' AND DATE(created_at) = CURDATE()
    `);
    const contentCompleted = content[0].completed || 0;

    // 8. Production Efficiency (productions completed today)
    // Note: Production table doesn't have created_at, so we'll count completed productions
    const [prodEff] = await pool.query(`
      SELECT COUNT(*) as completed_today
      FROM production 
      WHERE DATE(completion_date) = CURDATE() 
        AND completion_date IS NOT NULL 
        AND production_status = 'completed'
    `);
    const avgProductionTime = prodEff[0].completed_today || 0;

    // 9. Publishing Consistency (posts published today)
    const [postsPublished] = await pool.query(`
      SELECT COUNT(*) as published
      FROM social_media 
      WHERE DATE(post_date) = CURDATE() 
        AND status = 'published'
    `);
    const postsPublishedToday = postsPublished[0].published || 0;

    res.json({
      callCenter: {
        ticketsToday: ticketsTotal,
        ticketsDone: ticketsDone,
        avgResolutionTime,
        escalationCount,
        reopenedTickets,
        satisfactionRate,
        satisfactionCount,
        satisfactionTotal,
      },
      digitalMedia: {
        ideasExecuted,
        contentCompleted,
        avgProductionTime,
        postsPublishedToday,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Top Contributors This Week
exports.getTopContributors = async (req, res) => {
  try {
    // Get top 5 contributors for this week
    const [rows] = await pool.query(`
      SELECT e.name, COUNT(i.idea_id) AS total_ideas, MIN(i.submission_date) as first_idea_date
      FROM ideas i
      JOIN employees e ON i.contributor_id = e.employee_id
      WHERE i.submission_date >= CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY
      GROUP BY i.contributor_id
      ORDER BY total_ideas DESC
      LIMIT 5
    `);
    // For each contributor, check if they have ideas before this week (for icon logic)
    const contributorIds = rows.map(r => r.name);
    const [repeatRows] = await pool.query(`
      SELECT e.name
      FROM ideas i
      JOIN employees e ON i.contributor_id = e.employee_id
      WHERE i.submission_date < CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY
        AND e.name IN (?)
      GROUP BY i.contributor_id
    `, [contributorIds]);
    const repeatNames = new Set(repeatRows.map(r => r.name));
    const result = rows.map(r => ({
      name: r.name,
      total_ideas: r.total_ideas,
      icon: repeatNames.has(r.name) ? 'repeat' : 'new',
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Top Complained Issues Today
exports.getTopComplainedIssues = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT issue_type, COUNT(*) AS issue_count
      FROM tickets
      WHERE DATE(created_at) = CURDATE()
      GROUP BY issue_type
      ORDER BY issue_count DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ticket Resolution Overview for Today
exports.getTicketResolutionOverview = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT resolution_status, COUNT(*) as count
      FROM tickets
      WHERE DATE(created_at) = CURDATE()
      GROUP BY resolution_status
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Weekly Ticket Trends (Grouped Bar Chart)
exports.getWeeklyTicketTrends = async (req, res) => {
  try {
    // Get the start of the current week (Saturday) in Africa/Mogadishu time
    const now = moment().tz('Africa/Mogadishu');
    let startOfWeek = now.clone().startOf('week').add(6, 'days'); // Saturday
    if (now.day() !== 6) {
      // If today is not Saturday, go back to the most recent Saturday
      startOfWeek = now.clone().day(6);
      if (startOfWeek.isAfter(now)) {
        startOfWeek = startOfWeek.subtract(7, 'days');
      }
    }
    const endOfWeek = now; // Up to today

    // Query tickets for the current week, grouped by day and status
    const [rows] = await pool.query(`
      SELECT 
        DATE(CONVERT_TZ(created_at, '+00:00', '+03:00')) as day,
        resolution_status,
        COUNT(*) as count
      FROM tickets
      WHERE 
        created_at >= CONVERT_TZ(?, '+00:00', '+03:00')
        AND created_at <= CONVERT_TZ(?, '+00:00', '+03:00')
      GROUP BY day, resolution_status
      ORDER BY day ASC
    `, [startOfWeek.format('YYYY-MM-DD 00:00:00'), endOfWeek.format('YYYY-MM-DD 23:59:59')]);

    // Build a result array for each day from Saturday to today
    const days = [];
    for (let i = 0; i <= now.diff(startOfWeek, 'days'); i++) {
      days.push(startOfWeek.clone().add(i, 'days').format('YYYY-MM-DD'));
    }
    const statuses = ['Done', 'In Progress', 'Pending', 'Reopened'];
    const result = days.map(day => {
      const dayData = { day };
      statuses.forEach(status => {
        const found = rows.find(r => r.day === day && r.resolution_status === status);
        dayData[status] = found ? found.count : 0;
      });
      return dayData;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Daily Ticket Volume (Simple Bar Chart - Peak Days)
exports.getDailyTicketVolume = async (req, res) => {
  try {
    // Get the start of the current week (Saturday) in Africa/Mogadishu time
    const now = moment().tz('Africa/Mogadishu');
    let startOfWeek = now.clone().startOf('week').add(6, 'days'); // Saturday
    if (now.day() !== 6) {
      // If today is not Saturday, go back to the most recent Saturday
      startOfWeek = now.clone().day(6);
      if (startOfWeek.isAfter(now)) {
        startOfWeek = startOfWeek.subtract(7, 'days');
      }
    }
    const endOfWeek = now; // Up to today

    // Debug logging
    console.log('=== Daily Ticket Volume Debug ===');
    console.log('Current time (Mogadishu):', now.format('YYYY-MM-DD HH:mm:ss'));
    console.log('Start of week:', startOfWeek.format('YYYY-MM-DD HH:mm:ss'));
    console.log('End of week:', endOfWeek.format('YYYY-MM-DD HH:mm:ss'));
    console.log('Day of week:', now.day()); // 0=Sunday, 6=Saturday

    const startDate = startOfWeek.format('YYYY-MM-DD 00:00:00');
    const endDate = endOfWeek.format('YYYY-MM-DD 23:59:59');
    
    console.log('SQL Start Date:', startDate);
    console.log('SQL End Date:', endDate);

    // Query total tickets per day for the current week (regardless of status)
    const [rows] = await pool.query(`
      SELECT 
        DATE(CONVERT_TZ(created_at, '+00:00', '+03:00')) as day,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE 
        created_at >= CONVERT_TZ(?, '+00:00', '+03:00')
        AND created_at <= CONVERT_TZ(?, '+00:00', '+03:00')
      GROUP BY day
      ORDER BY day ASC
    `, [startDate, endDate]);

    console.log('Raw SQL Results:', rows);

    // Also check total tickets in the date range
    const [totalCheck] = await pool.query(`
      SELECT COUNT(*) as total_in_range
      FROM tickets
      WHERE 
        created_at >= CONVERT_TZ(?, '+00:00', '+03:00')
        AND created_at <= CONVERT_TZ(?, '+00:00', '+03:00')
    `, [startDate, endDate]);

    console.log('Total tickets in date range:', totalCheck[0].total_in_range);

    // Check all tickets to see their dates
    const [allTickets] = await pool.query(`
      SELECT created_at, DATE(CONVERT_TZ(created_at, '+00:00', '+03:00')) as mogadishu_date
      FROM tickets
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('Recent 10 tickets:', allTickets);

    // Build a result array for each day from Saturday to today
    const days = [];
    for (let i = 0; i <= now.diff(startOfWeek, 'days'); i++) {
      days.push(startOfWeek.clone().add(i, 'days').format('YYYY-MM-DD'));
    }
    
    const result = days.map(day => {
      const found = rows.find(r => r.day === day);
      return {
        day: day,
        total_tickets: found ? found.total_tickets : 0
      };
    });

    console.log('Final result:', result);
    console.log('=== End Debug ===');

    res.json(result);
  } catch (err) {
    console.error('Daily Ticket Volume Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Simple Ticket Volume (Fallback - Last 7 days)
exports.getSimpleTicketVolume = async (req, res) => {
  try {
    console.log('=== Simple Ticket Volume Debug ===');
    
    // Simple query: last 7 days from now
    const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) as day,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `);

    console.log('Simple query results:', rows);

    // Get total tickets in last 7 days
    const [totalCheck] = await pool.query(`
      SELECT COUNT(*) as total_in_range
      FROM tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    console.log('Total tickets in last 7 days:', totalCheck[0].total_in_range);

    // Get all tickets to see what we have
    const [allTickets] = await pool.query(`
      SELECT created_at, DATE(created_at) as simple_date
      FROM tickets
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('Recent 10 tickets (simple):', allTickets);

    // Create result with last 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      
      const found = rows.find(r => r.day === dayStr);
      result.push({
        day: dayStr,
        total_tickets: found ? found.total_tickets : 0
      });
    }

    console.log('Simple final result:', result);
    console.log('=== End Simple Debug ===');

    res.json(result);
  } catch (err) {
    console.error('Simple Ticket Volume Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// All Ticket Volume (Last 30 days - Date Agnostic)
exports.getAllTicketVolume = async (req, res) => {
  try {
    console.log('=== All Ticket Volume Debug ===');
    
    // Get tickets from the last 30 days, grouped by day
    const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) as day,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY day DESC
      LIMIT 7
    `);

    console.log('All ticket volume results:', rows);

    // Get total tickets in database
    const [totalTickets] = await pool.query(`
      SELECT COUNT(*) as total_tickets FROM tickets
    `);

    console.log('Total tickets in database:', totalTickets[0].total_tickets);

    // Get date range of tickets
    const [dateRange] = await pool.query(`
      SELECT 
        MIN(created_at) as earliest_ticket,
        MAX(created_at) as latest_ticket
      FROM tickets
    `);

    console.log('Ticket date range:', dateRange[0]);

    // Create result with the last 7 days that have data
    const result = rows.map(row => ({
      day: row.day,
      total_tickets: row.total_tickets
    }));

    console.log('Final result:', result);
    console.log('=== End All Ticket Debug ===');

    res.json(result);
  } catch (err) {
    console.error('All Ticket Volume Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Ticket States (Open vs Closed based on end_time) - Today Only
exports.getTicketStates = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS total_tickets,
        COUNT(CASE WHEN end_time IS NULL THEN 1 END) AS open_tickets,
        COUNT(CASE WHEN end_time IS NOT NULL THEN 1 END) AS closed_tickets
      FROM tickets
      WHERE DATE(created_at) = CURDATE()
    `);
    
    const result = rows[0];
    res.json({
      total_tickets: result.total_tickets || 0,
      open_tickets: result.open_tickets || 0,
      closed_tickets: result.closed_tickets || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// First Call Resolution (FCR) Rate for Today
exports.getFcrRate = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS total_tickets,
        SUM(first_call_resolution = 1) AS fcr_tickets
      FROM tickets
      WHERE DATE(created_at) = CURDATE()
    `);
    const { total_tickets, fcr_tickets } = rows[0];
    const fcr_rate = total_tickets > 0 ? Math.round((fcr_tickets / total_tickets) * 100) : 0;
    res.json({ total_tickets, fcr_tickets, fcr_rate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 