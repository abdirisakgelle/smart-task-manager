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
    const [ticketsYesterday] = await pool.query(`
      SELECT COUNT(*) as total, SUM(LOWER(resolution_status) = 'done') as done
      FROM tickets WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
    `);
    const ticketsTotal = ticketsToday[0].total || 0;
    const ticketsDone = ticketsToday[0].done || 0;
    const ticketsTotalYesterday = ticketsYesterday[0].total || 0;
    const ticketsDoneYesterday = ticketsYesterday[0].done || 0;

    // 2. Average Resolution Time (for tickets resolved today/yesterday only)
    const [avgResTime] = await pool.query(`
      SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_minutes
      FROM tickets 
      WHERE DATE(created_at) = CURDATE() 
        AND LOWER(resolution_status) = 'done' 
        AND end_time IS NOT NULL
    `);
    const [avgResTimeYesterday] = await pool.query(`
      SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_minutes
      FROM tickets 
      WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
        AND LOWER(resolution_status) = 'done' 
        AND end_time IS NOT NULL
    `);
    const avgResolutionTime = Math.round(avgResTime[0].avg_minutes || 0);
    const avgResolutionTimeYesterday = Math.round(avgResTimeYesterday[0].avg_minutes || 0);

    // 3. Escalation Rate (tickets escalated to supervisor reviews today/yesterday)
    const [escalated] = await pool.query(`
      SELECT COUNT(DISTINCT t.ticket_id) as escalated
      FROM tickets t
      INNER JOIN supervisor_reviews sr ON t.ticket_id = sr.ticket_id
      WHERE DATE(t.created_at) = CURDATE()
    `);
    const [escalatedYesterday] = await pool.query(`
      SELECT COUNT(DISTINCT t.ticket_id) as escalated
      FROM tickets t
      INNER JOIN supervisor_reviews sr ON t.ticket_id = sr.ticket_id
      WHERE DATE(t.created_at) = CURDATE() - INTERVAL 1 DAY
    `);
    const escalationCount = escalated[0].escalated || 0;
    const escalationCountYesterday = escalatedYesterday[0].escalated || 0;

    // 4. Reopened Tickets (tickets marked as Reopened today/yesterday based on follow-up date)
    const [reopened] = await pool.query(`
      SELECT COUNT(DISTINCT t.ticket_id) as total
      FROM tickets t
      INNER JOIN follow_ups f ON t.ticket_id = f.ticket_id
      WHERE DATE(f.follow_up_date) = CURDATE() 
        AND t.resolution_status = 'Reopened'
        AND f.issue_solved = 0
    `);
    const [reopenedYesterday] = await pool.query(`
      SELECT COUNT(DISTINCT t.ticket_id) as total
      FROM tickets t
      INNER JOIN follow_ups f ON t.ticket_id = f.ticket_id
      WHERE DATE(f.follow_up_date) = CURDATE() - INTERVAL 1 DAY
        AND t.resolution_status = 'Reopened'
        AND f.issue_solved = 0
    `);
    const reopenedTickets = reopened[0].total || 0;
    const reopenedTicketsYesterday = reopenedYesterday[0].total || 0;

    // 5. Customer Satisfaction (based on today's/yesterday's follow-up data)
    const [satisfaction] = await pool.query(`
      SELECT COUNT(*) as total, SUM(satisfied = 1) as satisfied
      FROM follow_ups 
      WHERE DATE(follow_up_date) = CURDATE() 
        AND satisfied IS NOT NULL
    `);
    const [satisfactionYesterday] = await pool.query(`
      SELECT COUNT(*) as total, SUM(satisfied = 1) as satisfied
      FROM follow_ups 
      WHERE DATE(follow_up_date) = CURDATE() - INTERVAL 1 DAY
        AND satisfied IS NOT NULL
    `);
    const satisfactionTotal = satisfaction[0].total || 0;
    const satisfactionCount = satisfaction[0].satisfied || 0;
    const satisfactionRate = satisfactionTotal > 0 ? Math.round((satisfactionCount / satisfactionTotal) * 100) : 0;
    const satisfactionTotalYesterday = satisfactionYesterday[0].total || 0;
    const satisfactionCountYesterday = satisfactionYesterday[0].satisfied || 0;
    const satisfactionRateYesterday = satisfactionTotalYesterday > 0 ? Math.round((satisfactionCountYesterday / satisfactionTotalYesterday) * 100) : 0;

    // 6. Ideas Executed (production ideas submitted today/yesterday)
    const [ideas] = await pool.query(`
      SELECT COUNT(*) as production
      FROM ideas 
      WHERE DATE(submission_date) = CURDATE() 
        AND status = 'production'
    `);
    const [ideasYesterday] = await pool.query(`
      SELECT COUNT(*) as production
      FROM ideas 
      WHERE DATE(submission_date) = CURDATE() - INTERVAL 1 DAY
        AND status = 'production'
    `);
    const ideasExecuted = ideas[0].production || 0;
    const ideasExecutedYesterday = ideasYesterday[0].production || 0;

    // 7. Content Produced (content marked completed today/yesterday)
    const [content] = await pool.query(`
      SELECT COUNT(*) as completed
      FROM content 
      WHERE content_status = 'Completed' AND DATE(created_at) = CURDATE()
    `);
    const [contentYesterday] = await pool.query(`
      SELECT COUNT(*) as completed
      FROM content 
      WHERE content_status = 'Completed' AND DATE(created_at) = CURDATE() - INTERVAL 1 DAY
    `);
    const contentCompleted = content[0].completed || 0;
    const contentCompletedYesterday = contentYesterday[0].completed || 0;

    // 8. Production Efficiency (productions completed today/yesterday)
    const [prodEff] = await pool.query(`
      SELECT COUNT(*) as completed_today
      FROM production 
      WHERE DATE(completion_date) = CURDATE() 
        AND completion_date IS NOT NULL 
        AND production_status = 'completed'
    `);
    const [prodEffYesterday] = await pool.query(`
      SELECT COUNT(*) as completed_today
      FROM production 
      WHERE DATE(completion_date) = CURDATE() - INTERVAL 1 DAY
        AND completion_date IS NOT NULL 
        AND production_status = 'completed'
    `);
    const avgProductionTime = prodEff[0].completed_today || 0;
    const avgProductionTimeYesterday = prodEffYesterday[0].completed_today || 0;

    // 9. Publishing Consistency (posts published today/yesterday)
    const [postsPublished] = await pool.query(`
      SELECT COUNT(*) as published
      FROM social_media 
      WHERE DATE(post_date) = CURDATE() 
        AND status = 'published'
    `);
    const [postsPublishedYesterday] = await pool.query(`
      SELECT COUNT(*) as published
      FROM social_media 
      WHERE DATE(post_date) = CURDATE() - INTERVAL 1 DAY
        AND status = 'published'
    `);
    const postsPublishedToday = postsPublished[0].published || 0;
    const postsPublishedYesterdayCount = postsPublishedYesterday[0].published || 0;

    res.json({
      callCenter: {
        ticketsToday: ticketsTotal,
        ticketsYesterday: ticketsTotalYesterday,
        ticketsDone: ticketsDone,
        ticketsDoneYesterday: ticketsDoneYesterday,
        avgResolutionTime,
        avgResolutionTimeYesterday,
        escalationCount,
        escalationCountYesterday,
        reopenedTickets,
        reopenedTicketsYesterday,
        satisfactionRate,
        satisfactionRateYesterday,
        satisfactionCount,
        satisfactionCountYesterday,
        satisfactionTotal,
        satisfactionTotalYesterday,
      },
      digitalMedia: {
        ideasExecuted,
        ideasExecutedYesterday,
        contentCompleted,
        contentCompletedYesterday,
        avgProductionTime,
        avgProductionTimeYesterday,
        postsPublishedToday,
        postsPublishedYesterday: postsPublishedYesterdayCount,
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
    
    // Handle empty results
    if (!rows || rows.length === 0) {
      return res.json([]);
    }
    
    // For each contributor, check if they have ideas before this week (for icon logic)
    const contributorIds = rows.map(r => r.name);
    
    if (contributorIds.length === 0) {
      return res.json([]);
    }
    
    const [repeatRows] = await pool.query(`
      SELECT e.name
      FROM ideas i
      JOIN employees e ON i.contributor_id = e.employee_id
      WHERE i.submission_date < CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY
        AND e.name IN (${contributorIds.map(() => '?').join(',')})
      GROUP BY i.contributor_id
    `, contributorIds);
    
    const repeatNames = new Set(repeatRows.map(r => r.name));
    const result = rows.map(r => ({
      name: r.name,
      total_ideas: r.total_ideas,
      icon: repeatNames.has(r.name) ? 'repeat' : 'new',
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error in getTopContributors:', err);
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

// Daily Ticket Volume (Current Operational Week - Saturday to Friday)
exports.getDailyTicketVolume = async (req, res) => {
  try {
    // Use UTC for consistency - this matches how the database stores dates
    const now = moment.utc();
    
    // Calculate the current operational week (Saturday to Friday)
    let startOfWeek = now.clone().startOf('week').add(6, 'days'); // Saturday
    if (now.day() !== 6) {
      // If today is not Saturday, go back to the most recent Saturday
      startOfWeek = now.clone().day(6);
      if (startOfWeek.isAfter(now)) {
        startOfWeek = startOfWeek.subtract(7, 'days');
      }
    }
    const endOfWeek = startOfWeek.clone().add(6, 'days'); // Friday

    console.log('=== Daily Ticket Volume Debug ===');
    console.log('Current time (UTC):', now.format('YYYY-MM-DD HH:mm:ss'));
    console.log('Operational week start:', startOfWeek.format('YYYY-MM-DD'));
    console.log('Operational week end:', endOfWeek.format('YYYY-MM-DD'));

    // Simple query using UTC dates - no timezone conversion needed
    const query = `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') as day,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE 
        DATE_FORMAT(created_at, '%Y-%m-%d') >= ?
        AND DATE_FORMAT(created_at, '%Y-%m-%d') <= ?
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY day ASC
    `;
    
    const params = [startOfWeek.format('YYYY-MM-DD'), endOfWeek.format('YYYY-MM-DD')];
    console.log('SQL Query:', query);
    console.log('Query parameters:', params);

    const [rows] = await pool.query(query, params);
    console.log('Raw query results:', rows);

    // Generate all 7 days from Saturday to Friday, ensuring every day is represented
    const result = [];
    const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = startOfWeek.clone().add(i, 'days');
      const dayStr = currentDay.format('YYYY-MM-DD');
      const dayName = dayNames[i];
      
      const found = rows.find(r => r.day === dayStr);
      const ticketCount = found ? found.total_tickets : 0;
      
      console.log(`Day ${i + 1}: ${dayStr} (${dayName}) - Found: ${found ? 'Yes' : 'No'} - Tickets: ${ticketCount}`);
      
      result.push({
        day: dayStr,
        dayName: dayName,
        total_tickets: ticketCount
      });
    }

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
    // Use the same logic as getDailyTicketVolume for consistency
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(DATE(created_at), '%Y-%m-%d') as day,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d')
      ORDER BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d') ASC
    `);

    // Generate the last 7 days (including today)
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

    res.json(result);
  } catch (err) {
    console.error('Simple Ticket Volume Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// All Ticket Volume (Last 7 days - Consistent with other endpoints)
exports.getAllTicketVolume = async (req, res) => {
  try {
    // Use the same logic as getDailyTicketVolume for consistency
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(DATE(created_at), '%Y-%m-%d') as day,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d')
      ORDER BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d') ASC
    `);

    // Generate the last 7 days (including today)
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

    res.json(result);
  } catch (err) {
    console.error('All Ticket Volume Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Ticket Volume by Issue Category (App vs IPTV) - Last 7 days
exports.getTicketVolumeByCategory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(DATE(created_at), '%Y-%m-%d') as date,
        issue_category,
        COUNT(*) as count
      FROM tickets
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND issue_category IN ('App', 'IPTV')
      GROUP BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d'), issue_category
      ORDER BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d') ASC, issue_category
    `);

    // Generate the last 7 days (including today)
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      
      const appTickets = rows.find(r => r.date === dayStr && r.issue_category === 'App');
      const iptvTickets = rows.find(r => r.date === dayStr && r.issue_category === 'IPTV');
      
      result.push({
        date: dayStr,
        app: appTickets ? appTickets.count : 0,
        iptv: iptvTickets ? iptvTickets.count : 0
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Ticket Volume by Category Error:', err);
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

// Test endpoint to create sample data for chart testing
exports.createTestTickets = async (req, res) => {
  try {
    // Insert test tickets for the last few days
    const testTickets = [
      { date: 'CURDATE()', count: 4 }, // Today - 4 tickets
      { date: 'DATE_SUB(CURDATE(), INTERVAL 1 DAY)', count: 2 }, // Yesterday - 2 tickets  
      { date: 'DATE_SUB(CURDATE(), INTERVAL 2 DAY)', count: 6 }, // 2 days ago - 6 tickets
      { date: 'DATE_SUB(CURDATE(), INTERVAL 3 DAY)', count: 1 }, // 3 days ago - 1 ticket
    ];

    for (const ticket of testTickets) {
      for (let i = 0; i < ticket.count; i++) {
        await pool.query(`
          INSERT INTO tickets (customer_phone, issue_category, issue_type, issue_description, agent_id, created_at)
          VALUES (?, ?, ?, ?, 1, ${ticket.date})
        `, [
          `123456789${i}`,
          'Technical',
          'System Issue',
          `Test ticket for chart testing - ${ticket.date}`
        ]);
      }
    }

    res.json({ 
      message: 'Test tickets created successfully',
      tickets_created: testTickets.reduce((sum, t) => sum + t.count, 0)
    });
  } catch (err) {
    console.error('Error creating test tickets:', err);
    res.status(500).json({ error: err.message });
  }
}; 

// Debug endpoint to check tickets in database
exports.debugTickets = async (req, res) => {
  try {
    const [allTickets] = await pool.query(`
      SELECT 
        ticket_id,
        DATE(created_at) as day,
        created_at,
        issue_type
      FROM tickets 
      ORDER BY created_at DESC 
      LIMIT 20
    `);

    const [todayCount] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM tickets 
      WHERE DATE(created_at) = CURDATE()
    `);

    const [dateRange] = await pool.query(`
      SELECT 
        MIN(created_at) as earliest,
        MAX(created_at) as latest,
        COUNT(*) as total
      FROM tickets
    `);

    res.json({
      recent_tickets: allTickets,
      today_count: todayCount[0].count,
      date_range: dateRange[0],
      current_date: new Date().toISOString().split('T')[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Debug endpoint: Show current operational week range and all ticket days (Africa/Mogadishu)
exports.getTicketVolumeDebug = async (req, res) => {
  try {
    const now = moment().tz('Africa/Mogadishu');
    let startOfWeek = now.clone().startOf('week').add(6, 'days'); // Saturday
    if (now.day() !== 6) {
      startOfWeek = now.clone().day(6);
      if (startOfWeek.isAfter(now)) {
        startOfWeek = startOfWeek.subtract(7, 'days');
      }
    }
    const endOfWeek = startOfWeek.clone().add(6, 'days'); // Friday

    // All ticket days after timezone conversion
    const [rows] = await pool.query(`
      SELECT 
        DATE(CONVERT_TZ(created_at, '+00:00', '+03:00')) as local_day,
        COUNT(*) as count
      FROM tickets
      GROUP BY local_day
      ORDER BY local_day ASC
    `);

    res.json({
      operational_week: {
        start: startOfWeek.format('YYYY-MM-DD'),
        end: endOfWeek.format('YYYY-MM-DD'),
        days: Array.from({length: 7}, (_, i) => startOfWeek.clone().add(i, 'days').format('YYYY-MM-DD'))
      },
      ticket_days: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Test timezone conversion
exports.testTimezoneConversion = async (req, res) => {
  try {
    // Test with a few sample dates
    const [testRows] = await pool.query(`
      SELECT 
        created_at,
        DATE(created_at) as utc_date,
        DATE(CONVERT_TZ(created_at, '+00:00', '+03:00')) as local_date
      FROM tickets
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      message: 'Timezone conversion test',
      sample_tickets: testRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Simple debug endpoint to see what's in the database
exports.debugDatabase = async (req, res) => {
  try {
    // Get current time in different timezones
    const nowUTC = moment.utc();
    const nowLocal = moment();
    const nowMogadishu = moment().tz('Africa/Mogadishu');
    
    // Get some sample tickets with their dates
    const [tickets] = await pool.query(`
      SELECT 
        ticket_id,
        created_at,
        DATE(created_at) as date_only,
        NOW() as server_now,
        @@global.time_zone as server_timezone
      FROM tickets 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.json({
      current_time: {
        utc: nowUTC.format('YYYY-MM-DD HH:mm:ss'),
        local: nowLocal.format('YYYY-MM-DD HH:mm:ss'),
        mogadishu: nowMogadishu.format('YYYY-MM-DD HH:mm:ss')
      },
      sample_tickets: tickets,
      server_info: {
        timezone: tickets[0]?.server_timezone || 'unknown',
        server_now: tickets[0]?.server_now || 'unknown'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Comprehensive debug endpoint
exports.debugAllDates = async (req, res) => {
  try {
    // Get current time in UTC
    const now = moment.utc();
    
    // Calculate operational week
    let startOfWeek = now.clone().startOf('week').add(6, 'days'); // Saturday
    if (now.day() !== 6) {
      startOfWeek = now.clone().day(6);
      if (startOfWeek.isAfter(now)) {
        startOfWeek = startOfWeek.subtract(7, 'days');
      }
    }
    const endOfWeek = startOfWeek.clone().add(6, 'days'); // Friday

    // Get all ticket dates
    const [allTickets] = await pool.query(`
      SELECT 
        DATE(created_at) as ticket_date,
        COUNT(*) as count
      FROM tickets
      GROUP BY DATE(created_at)
      ORDER BY ticket_date DESC
    `);

    // Test the specific query
    const [weekTickets] = await pool.query(`
      SELECT 
        DATE(created_at) as day,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE 
        DATE(created_at) >= ?
        AND DATE(created_at) <= ?
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `, [startOfWeek.format('YYYY-MM-DD'), endOfWeek.format('YYYY-MM-DD')]);

    res.json({
      current_info: {
        now_utc: now.format('YYYY-MM-DD HH:mm:ss'),
        current_day_of_week: now.day(), // 0=Sunday, 6=Saturday
        operational_week_start: startOfWeek.format('YYYY-MM-DD'),
        operational_week_end: endOfWeek.format('YYYY-MM-DD')
      },
      all_ticket_dates: allTickets,
      week_query_results: weekTickets,
      week_query_params: [startOfWeek.format('YYYY-MM-DD'), endOfWeek.format('YYYY-MM-DD')]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Recent Tickets Widget
exports.getRecentTickets = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.ticket_id,
        t.customer_phone,
        t.issue_category,
        t.issue_type,
        t.resolution_status as status,
        t.created_at,
        t.end_time
      FROM tickets t
      ORDER BY t.created_at DESC
      LIMIT 10
    `);
    
    const tickets = rows.map(ticket => ({
      ticket_id: ticket.ticket_id,
      customer_phone: ticket.customer_phone,
      issue_category: ticket.issue_category,
      issue_type: ticket.issue_type,
      status: ticket.status,
      created_at: ticket.created_at,
      end_time: ticket.end_time
    }));
    
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ideas Produced Today Widget
exports.getIdeasProducedToday = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.idea_id,
        i.title,
        i.priority,
        i.status,
        i.submission_date as created_at,
        e.name as submitted_by
      FROM ideas i
      LEFT JOIN employees e ON i.contributor_id = e.employee_id
      WHERE DATE(i.submission_date) = CURDATE()
      ORDER BY i.submission_date DESC
      LIMIT 10
    `);
    
    const ideas = rows.map(idea => ({
      idea_id: idea.idea_id,
      title: idea.title,
      priority: idea.priority,
      status: idea.status,
      created_at: idea.created_at,
      submitted_by: idea.submitted_by
    }));
    
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Role-based Dashboard Controllers

// Admin Dashboard - Full system access with comprehensive metrics
exports.getAdminDashboard = async (req, res) => {
  try {
    // System Overview - Tickets
    const [tickets] = await pool.query(`
      SELECT 
        COUNT(*) as total, 
        SUM(LOWER(resolution_status) = 'done') as done,
        SUM(LOWER(resolution_status) = 'pending') as pending,
        AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_resolution_time
      FROM tickets WHERE DATE(created_at) = CURDATE()
    `);
    
    // System Overview - Users and Employees
    const [users] = await pool.query(`
      SELECT COUNT(*) as total FROM users WHERE status = 'active'
    `);
    
    const [employees] = await pool.query(`
      SELECT COUNT(*) as total FROM employees
    `);
    
    // System Overview - Sections and Units
    const [sections] = await pool.query(`
      SELECT COUNT(*) as total FROM sections
    `);
    
    const [units] = await pool.query(`
      SELECT COUNT(*) as total FROM units
    `);
    
    // New: Departments count
    const [departments] = await pool.query(`
      SELECT COUNT(*) as total FROM departments
    `);
    
    // New: Total Tasks count - Created Today
    const [totalTasks] = await pool.query(`
      SELECT COUNT(*) as total FROM tasks 
      WHERE DATE(created_at) = CURDATE()
    `);
    
    // New: Overdue Tasks count - Created Today and Past Due
    const [overdueTasks] = await pool.query(`
      SELECT COUNT(*) as total FROM tasks 
      WHERE DATE(created_at) = CURDATE() AND due_date < CURDATE() AND status != 'completed'
    `);
    
    // Content Production Metrics
    const [content] = await pool.query(`
      SELECT 
        COUNT(*) as total_ideas,
        SUM(status = 'approved') as approved_ideas,
        SUM(status = 'completed') as completed_ideas
      FROM ideas WHERE DATE(submission_date) = CURDATE()
    `);
    
    // Content Completed Today - Fixed query to use content table (case-insensitive)
    const [contentCompleted] = await pool.query(`
      SELECT COUNT(*) as completed_today
      FROM content WHERE LOWER(content_status) = 'completed' AND DATE(created_at) = CURDATE()
    `);
    
    const [socialMedia] = await pool.query(`
      SELECT COUNT(*) as total_posts
      FROM social_media WHERE DATE(post_date) = CURDATE() AND status = 'published'
    `);
    
    // New: Productions count
    const [productions] = await pool.query(`
      SELECT COUNT(*) as total_productions
      FROM production WHERE DATE(completion_date) = CURDATE() AND production_status = 'completed'
    `);
    
    // Performance Metrics
    const [performance] = await pool.query(`
      SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_ticket_time,
        COUNT(DISTINCT agent_id) as active_agents
      FROM tickets 
      WHERE DATE(created_at) = CURDATE() AND LOWER(resolution_status) = 'done'
    `);
    
    // Escalations and Reopened tickets
    const [escalations] = await pool.query(`
      SELECT COUNT(*) as total_escalations
      FROM tickets 
      WHERE DATE(created_at) = CURDATE() AND resolution_status = 'escalated'
    `);
    
    const [reopened] = await pool.query(`
      SELECT COUNT(DISTINCT t.ticket_id) as total_reopened
      FROM tickets t
      INNER JOIN follow_ups f ON t.ticket_id = f.ticket_id
      WHERE DATE(f.follow_up_date) = CURDATE() 
        AND t.resolution_status = 'reopened'
        AND f.issue_solved = 0
    `);
    
    // FCR Rate calculation
    const [fcrData] = await pool.query(`
      SELECT 
        COUNT(*) as total_tickets,
        SUM(first_call_resolution = 1) as fcr_tickets
      FROM tickets 
      WHERE DATE(created_at) = CURDATE()
    `);
    
    // Satisfaction Rate calculation (fixed NaN% issue)
    const [satisfactionData] = await pool.query(`
      SELECT 
        COUNT(*) as total_followups,
        SUM(satisfied = 1) as satisfied_count
      FROM follow_ups f
      JOIN tickets t ON f.ticket_id = t.ticket_id
      WHERE DATE(f.follow_up_date) = CURDATE()
    `);
    
    // Charts Data - Ticket Trends (Last 7 days)
    const [ticketTrends] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(LOWER(resolution_status) = 'done') as resolved
      FROM tickets 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    
    // Charts Data - User Activity by Role
    const [userActivity] = await pool.query(`
      SELECT 
        role,
        COUNT(*) as count
      FROM users 
      WHERE status = 'active'
      GROUP BY role
    `);
    
    // Charts Data - Content Production Trends
    const [contentTrends] = await pool.query(`
      SELECT 
        DATE(submission_date) as date,
        COUNT(*) as ideas_submitted,
        SUM(status = 'approved') as ideas_approved
      FROM ideas 
      WHERE submission_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(submission_date)
      ORDER BY date
    `);
    
    // Charts Data - Department Performance
    const [departmentPerformance] = await pool.query(`
      SELECT 
        d.name as department,
        COUNT(e.employee_id) as employee_count,
        COUNT(t.ticket_id) as tickets_handled
      FROM departments d
      LEFT JOIN sections s ON d.department_id = s.department_id
      LEFT JOIN units u ON s.section_id = u.section_id
      LEFT JOIN employees e ON u.unit_id = e.unit_id
      LEFT JOIN tickets t ON e.employee_id = t.agent_id AND DATE(t.created_at) = CURDATE()
      GROUP BY d.department_id, d.name
    `);
    
    // Recent Activity
    const [recentTickets] = await pool.query(`
      SELECT 
        t.ticket_id, 
        t.issue_type, 
        t.resolution_status, 
        t.created_at,
        e.name as agent_name
      FROM tickets t
      LEFT JOIN employees e ON t.agent_id = e.employee_id
      ORDER BY t.created_at DESC 
      LIMIT 10
    `);
    
    const [recentIdeas] = await pool.query(`
      SELECT 
        i.idea_id, 
        i.title, 
        i.status, 
        i.submission_date,
        e.name as contributor_name
      FROM ideas i
      LEFT JOIN employees e ON i.contributor_id = e.employee_id
      ORDER BY i.submission_date DESC 
      LIMIT 10
    `);
    
    // System Health Metrics
    const [systemHealth] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
        COUNT(DISTINCT agent_id) as active_agents,
        AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_response_time
      FROM tickets 
      WHERE DATE(created_at) = CURDATE()
    `);
    
    // Widget Data - Quick Stats
    const [quickStats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM tickets WHERE DATE(created_at) = CURDATE()) as tickets_today,
        (SELECT COUNT(*) FROM ideas WHERE DATE(submission_date) = CURDATE()) as ideas_today,
        (SELECT COUNT(*) FROM social_media WHERE DATE(post_date) = CURDATE() AND status = 'published') as posts_today,
        (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users
    `);
    
    // Widget 1: Top Contributors - Digital Media (This Week)
    const [topContributors] = await pool.query(`
      SELECT 
        e.name,
        COUNT(i.idea_id) as ideas_submitted
      FROM ideas i
      JOIN employees e ON i.contributor_id = e.employee_id
      WHERE i.submission_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY e.employee_id, e.name
      ORDER BY ideas_submitted DESC
      LIMIT 3
    `);
    
    // Widget 2: Best Performers - Customer Support Agents (This Week)
    const [bestPerformers] = await pool.query(`
      SELECT 
        e.name,
        COUNT(t.ticket_id) as tickets_resolved
      FROM tickets t
      JOIN employees e ON t.agent_id = e.employee_id
      WHERE t.resolution_status = 'done' 
        AND t.end_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY t.agent_id, e.name
      ORDER BY tickets_resolved DESC
      LIMIT 3
    `);
    
    // Chart 1: Customer Support Trends - Ticket Volume by Category (Last 7 Days)
    const [customerSupportTrends] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        issue_type as category,
        COUNT(*) as count
      FROM tickets 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at), issue_type
      ORDER BY date ASC, category ASC
    `);
    

    
    // Chart 2: Digital Media Activity - Content Output (Last 7 Days)
    const [digitalMediaActivity] = await pool.query(`
      SELECT 
        'ideas' as type,
        DATE(submission_date) as date,
        COUNT(*) as count
      FROM ideas 
      WHERE submission_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(submission_date)
      UNION ALL
      SELECT 
        'social_posts' as type,
        DATE(post_date) as date,
        COUNT(*) as count
      FROM social_media 
      WHERE post_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = 'published'
      GROUP BY DATE(post_date)
      ORDER BY date ASC, type ASC
    `);
    

    
    // Calculate FCR Rate
    const totalTickets = fcrData[0].total_tickets || 0;
    const fcrTickets = fcrData[0].fcr_tickets || 0;
    const fcrRate = totalTickets > 0 ? Math.round((fcrTickets / totalTickets) * 100) : 0;
    
    // Calculate Satisfaction Rate (fixed NaN% issue)
    const totalFollowups = satisfactionData[0].total_followups || 0;
    const satisfiedCount = satisfactionData[0].satisfied_count || 0;
    const satisfactionRate = totalFollowups > 0 ? Math.round((satisfiedCount / totalFollowups) * 100) : 0;
    
    res.json({
      role: 'admin',
      scope: 'system',
      data: {
        // Main KPIs - 4x4 Layout
        kpis: {
          // Row 1
          tickets_today: tickets[0].total || 0,
          avg_resolution_time: Math.round(tickets[0].avg_resolution_time || 0),
          escalations: escalations[0].total_escalations || 0,
          reopened_tickets: reopened[0].total_reopened || 0,
          
          // Row 2
          fcr_rate: fcrRate,
          satisfaction: satisfactionRate,
          ideas_today: content[0].total_ideas || 0,
          content_produced: contentCompleted[0].completed_today || 0,
          
          // Row 3
          productions: productions[0].total_productions || 0,
          posts_published: socialMedia[0].total_posts || 0,
          active_users: users[0].total || 0,
          employees: employees[0].total || 0,
          
          // Row 4
          sections: sections[0].total || 0,
          departments: departments[0].total || 0,
          units: units[0].total || 0,
          total_tasks: totalTasks[0].total || 0,
          overdue_tasks: overdueTasks[0].total || 0
        },
        
        // Legacy data for backward compatibility
        tickets: {
          total: tickets[0].total || 0,
          done: tickets[0].done || 0,
          pending: tickets[0].pending || 0,
          avg_resolution_time: Math.round(tickets[0].avg_resolution_time || 0)
        },
        users: {
          total: users[0].total || 0
        },
        employees: {
          total: employees[0].total || 0
        },
        sections: {
          total: sections[0].total || 0
        },
        units: {
          total: units[0].total || 0
        },
        content: {
          ideas_today: content[0].total_ideas || 0,
          approved_ideas: content[0].approved_ideas || 0,
          completed_ideas: content[0].completed_ideas || 0,
          social_posts: socialMedia[0].total_posts || 0
        },
        performance: {
          avg_ticket_time: Math.round(performance[0].avg_ticket_time || 0),
          active_agents: performance[0].active_agents || 0,
          system_uptime: 99.9, // Mock system uptime
          data_integrity: 100 // Mock data integrity score
        },
        
        // Charts Data
        charts: {
          ticket_trends: ticketTrends,
          user_activity: userActivity,
          content_trends: contentTrends,
          department_performance: departmentPerformance,
          customer_support_trends: customerSupportTrends,
          digital_media_activity: digitalMediaActivity
        },
        
        // Widgets Data
        widgets: {
          quick_stats: quickStats[0],
          system_health: systemHealth[0],
          recent_activity: {
            tickets: recentTickets,
            ideas: recentIdeas
          },
          top_contributors: topContributors,
          best_performers: bestPerformers
        }
      }
    });
  } catch (err) {
    console.error('Admin Dashboard Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// CEO Dashboard - High-level strategic view (read-only)
exports.getCeoDashboard = async (req, res) => {
  try {
    // CEO gets aggregated KPIs and read-only summaries
    const [tickets] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(LOWER(resolution_status) = 'done') as done,
        AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_handle_time
      FROM tickets WHERE DATE(created_at) = CURDATE()
    `);
    
    const [sections] = await pool.query(`
      SELECT s.section_name, COUNT(t.ticket_id) as ticket_count
      FROM sections s
      LEFT JOIN tickets t ON DATE(t.created_at) = CURDATE()
      GROUP BY s.section_id
    `);
    
    const [impact] = await pool.query(`
      SELECT 
        COUNT(*) as total_ideas,
        SUM(status = 'production') as ideas_executed
      FROM ideas WHERE DATE(submission_date) = CURDATE()
    `);
    
    res.json({
      role: 'ceo',
      scope: 'strategic_readonly',
      data: {
        kpis: {
          total_tickets: tickets[0].total || 0,
          resolved_tickets: tickets[0].done || 0,
          avg_resolution_time: Math.round(tickets[0].avg_handle_time || 0)
        },
        section_performance: sections,
        impact_metrics: {
          total_ideas: impact[0].total_ideas || 0,
          ideas_executed: impact[0].ideas_executed || 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Section Manager Dashboard - Section-level access
exports.getSectionManagerDashboard = async (req, res) => {
  try {
    const { sectionId } = req.dataScope;
    
    if (!sectionId) {
      return res.status(403).json({ error: 'Section ID required for manager access' });
    }
    
    // Section manager gets data filtered by their section
    const [tickets] = await pool.query(`
      SELECT COUNT(*) as total, SUM(LOWER(resolution_status) = 'done') as done
      FROM tickets t
      JOIN employees e ON t.agent_id = e.employee_id
      WHERE e.section_id = ? AND DATE(t.created_at) = CURDATE()
    `, [sectionId]);
    
    const [team] = await pool.query(`
      SELECT COUNT(*) as total_employees
      FROM employees WHERE section_id = ?
    `, [sectionId]);
    
    const [assignments] = await pool.query(`
      SELECT COUNT(*) as total_assignments
      FROM employee_assignments ea
      JOIN employees e ON ea.employee_id = e.employee_id
      WHERE e.section_id = ?
    `, [sectionId]);
    
    res.json({
      role: 'manager',
      scope: 'section_level',
      section_id: sectionId,
      data: {
        tickets: {
          total: tickets[0].total || 0,
          done: tickets[0].done || 0
        },
        team: {
          total_employees: team[0].total_employees || 0
        },
        assignments: {
          total: assignments[0].total_assignments || 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User Dashboard - Individual task views or section performance for managers
exports.getUserDashboard = async (req, res) => {
  try {
    const { role, employeeId, sectionId } = req.dataScope;
    
    if (role === 'manager') {
      // Section manager gets section-wide data
      if (!sectionId) {
        return res.status(403).json({ error: 'Section ID required for manager access' });
      }
      
      // Section manager gets data filtered by their section
      const [tickets] = await pool.query(`
        SELECT COUNT(*) as total, SUM(LOWER(resolution_status) = 'done') as done
        FROM tickets t
        JOIN employees e ON t.agent_id = e.employee_id
        WHERE e.section_id = ? AND DATE(t.created_at) = CURDATE()
      `, [sectionId]);
      
      const [team] = await pool.query(`
        SELECT COUNT(*) as total_employees
        FROM employees WHERE section_id = ?
      `, [sectionId]);
      
      const [assignments] = await pool.query(`
        SELECT COUNT(*) as total_assignments
        FROM employee_assignments ea
        JOIN employees e ON ea.employee_id = e.employee_id
        WHERE e.section_id = ?
      `, [sectionId]);
      
      res.json({
        role: 'manager',
        scope: 'section_level',
        section_id: sectionId,
        data: {
          tickets: {
            total: tickets[0].total || 0,
            done: tickets[0].done || 0
          },
          team: {
            total_employees: team[0].total_employees || 0
          },
          assignments: {
            total: assignments[0].total_assignments || 0
          }
        }
      });
    } else {
      // Regular users get individual performance data
      if (!employeeId) {
        return res.status(403).json({ error: 'Employee ID required for user access' });
      }
      
      // User gets only their assigned tasks and personal data
      const [tasks] = await pool.query(`
        SELECT COUNT(*) as total, SUM(status = 'completed') as completed
        FROM tasks WHERE assigned_to = ?
      `, [employeeId]);
      
      const [recentTasks] = await pool.query(`
        SELECT task_id, title, status, priority, created_at
        FROM tasks 
        WHERE assigned_to = ?
        ORDER BY created_at DESC
        LIMIT 5
      `, [employeeId]);
      
      const [notifications] = await pool.query(`
        SELECT COUNT(*) as unread_count
        FROM notifications 
        WHERE user_id = ? AND is_read = 0
      `, [employeeId]);
      
      res.json({
        role: req.dataScope.role,
        scope: 'individual',
        employee_id: employeeId,
        data: {
          tasks: {
            total: tasks[0].total || 0,
            completed: tasks[0].completed || 0
          },
          recent_tasks: recentTasks,
          notifications: {
            unread: notifications[0].unread_count || 0
          }
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Agent Dashboard - Call center agent specific data
exports.getAgentDashboard = async (req, res) => {
  try {
    const { employeeId } = req.dataScope;
    
    if (!employeeId) {
      return res.status(403).json({ error: 'Employee ID required for agent access' });
    }
    
    // Agent gets their ticket handling data
    const [tickets] = await pool.query(`
      SELECT COUNT(*) as handled, SUM(LOWER(resolution_status) = 'done') as resolved
      FROM tickets WHERE agent_id = ? AND DATE(created_at) = CURDATE()
    `, [employeeId]);
    
    const [performance] = await pool.query(`
      SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_handle_time,
        SUM(first_call_resolution = 1) as fcr_count,
        COUNT(*) as total_tickets
      FROM tickets 
      WHERE agent_id = ? AND DATE(created_at) = CURDATE()
    `, [employeeId]);
    
    const [recentTickets] = await pool.query(`
      SELECT ticket_id, customer_phone, issue_type, resolution_status as status, created_at
      FROM tickets 
      WHERE agent_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [employeeId]);
    
    const [satisfaction] = await pool.query(`
      SELECT AVG(satisfied) * 100 as satisfaction_rate
      FROM follow_ups f
      JOIN tickets t ON f.ticket_id = t.ticket_id
      WHERE t.agent_id = ? AND DATE(f.follow_up_date) = CURDATE()
    `, [employeeId]);
    
    res.json({
      role: 'agent',
      scope: 'individual',
      employee_id: employeeId,
      data: {
        tickets: {
          handled: tickets[0].handled || 0,
          resolved: tickets[0].resolved || 0
        },
        performance: {
          avg_handle_time: Math.round(performance[0].avg_handle_time || 0),
          fcr_rate: performance[0].total_tickets > 0 ? Math.round((performance[0].fcr_count / performance[0].total_tickets) * 100) : 0,
          escalation_rate: 0, // Calculate based on escalations
          avg_response_time: Math.round(performance[0].avg_handle_time || 0),
          quality_score: 85, // Mock quality score
          compliance_rate: 95, // Mock compliance rate
          knowledge_score: 88 // Mock knowledge score
        },
        satisfaction: {
          rate: Math.round(satisfaction[0].satisfaction_rate || 0)
        },
        recent_tickets: recentTickets
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Content Dashboard - Content creator specific data
exports.getContentDashboard = async (req, res) => {
  try {
    const { employeeId } = req.dataScope;
    
    if (!employeeId) {
      return res.status(403).json({ error: 'Employee ID required for content creator access' });
    }
    
    // Content creator gets their content creation data
    const [ideas] = await pool.query(`
      SELECT COUNT(*) as submitted
      FROM ideas WHERE contributor_id = ? AND MONTH(submission_date) = MONTH(CURDATE())
    `, [employeeId]);
    
    // Get ideas by status for workflow metrics
    const [ideasByStatus] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM ideas WHERE contributor_id = ?
      GROUP BY status
    `, [employeeId]);
    
    // Fixed: Use director_id instead of creator_id, and check for completed status (case-insensitive)
    const [content] = await pool.query(`
      SELECT COUNT(*) as produced
      FROM content WHERE director_id = ? AND LOWER(content_status) = 'completed'
    `, [employeeId]);
    
    // Get content by status
    const [contentByStatus] = await pool.query(`
      SELECT content_status, COUNT(*) as count
      FROM content WHERE director_id = ?
      GROUP BY content_status
    `, [employeeId]);
    
    // Fixed: Use director_id instead of creator_id, and remove engagement_rate since it doesn't exist
    const [social] = await pool.query(`
      SELECT COUNT(*) as posts
      FROM social_media WHERE content_id IN (
        SELECT content_id FROM content WHERE director_id = ?
      ) AND status = 'published'
    `, [employeeId]);
    
    // Get social media posts by platform
    const [socialByPlatform] = await pool.query(`
      SELECT platforms, COUNT(*) as count
      FROM social_media WHERE content_id IN (
        SELECT content_id FROM content WHERE director_id = ?
      ) AND status = 'published'
      GROUP BY platforms
    `, [employeeId]);
    
    const [recentIdeas] = await pool.query(`
      SELECT idea_id, title, status, submission_date, priority
      FROM ideas 
      WHERE contributor_id = ?
      ORDER BY submission_date DESC
      LIMIT 5
    `, [employeeId]);
    
    // Calculate workflow metrics
    const pendingIdeas = ideasByStatus.find(item => item.status === 'pending')?.count || 0;
    const approvedIdeas = ideasByStatus.find(item => item.status === 'approved')?.count || 0;
    const inProgressContent = contentByStatus.find(item => item.content_status === 'in_progress')?.count || 0;
    const completedContent = contentByStatus.find(item => LOWER(item.content_status) === 'completed')?.count || 0;
    
    // Calculate performance metrics
    const totalIdeas = ideas[0].submitted || 0;
    const approvalRate = totalIdeas > 0 ? Math.round((approvedIdeas / totalIdeas) * 100) : 0;
    const avgProductionTime = 3; // Mock data - could be calculated from actual production dates
    const qualityScore = 92; // Mock data - could be calculated from reviews
    
    const response = {
      role: 'media',
      scope: 'individual',
      employee_id: employeeId,
      data: {
        ideas: {
          submitted: ideas[0].submitted || 0,
          pending: pendingIdeas,
          approved: approvedIdeas,
          total: totalIdeas
        },
        content: {
          produced: content[0].produced || 0,
          in_progress: inProgressContent,
          completed: completedContent,
          total: inProgressContent + completedContent
        },
        social: {
          posts: social[0].posts || 0,
          engagement: 85, // Mock engagement rate since column doesn't exist
          reach: 15000, // Mock reach data
          likes: 1200, // Mock likes data
          shares: 300, // Mock shares data
          platforms: socialByPlatform
        },
        performance: {
          approval_rate: approvalRate,
          avg_production_time: avgProductionTime,
          quality_score: qualityScore,
          efficiency_score: 88 // Mock efficiency score
        },
        workflow: {
          ideas: pendingIdeas,
          production: inProgressContent,
          published: social[0].posts || 0,
          completed: completedContent
        },
        recent_ideas: recentIdeas
      }
    };
    
    res.json(response);
  } catch (err) {
    console.error('Content Dashboard Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Supervisor Dashboard - Team oversight data
exports.getSupervisorDashboard = async (req, res) => {
  try {
    const { employeeId } = req.dataScope;
    
    if (!employeeId) {
      return res.status(403).json({ error: 'Employee ID required for supervisor access' });
    }
    
    // Supervisor gets team oversight data
    const [team] = await pool.query(`
      SELECT COUNT(*) as members
      FROM employees WHERE supervisor_id = ?
    `, [employeeId]);
    
    const [reviews] = await pool.query(`
      SELECT COUNT(*) as pending
      FROM supervisor_reviews WHERE supervisor_id = ? AND status = 'pending'
    `, [employeeId]);
    
    const [quality] = await pool.query(`
      SELECT AVG(quality_score) as score
      FROM supervisor_reviews WHERE supervisor_id = ? AND DATE(review_date) = CURDATE()
    `, [employeeId]);
    
    const [escalations] = await pool.query(`
      SELECT COUNT(*) as total
      FROM tickets t
      JOIN supervisor_reviews sr ON t.ticket_id = sr.ticket_id
      WHERE sr.supervisor_id = ? AND DATE(t.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `, [employeeId]);
    
    const [teamPerformance] = await pool.query(`
      SELECT 
        e.name, e.role,
        COUNT(t.ticket_id) as tickets_handled,
        AVG(sr.quality_score) as quality_score,
        AVG(f.satisfied) * 100 as satisfaction_rate
      FROM employees e
      LEFT JOIN tickets t ON e.employee_id = t.agent_id AND DATE(t.created_at) = CURDATE()
      LEFT JOIN supervisor_reviews sr ON e.employee_id = sr.agent_id
      LEFT JOIN follow_ups f ON t.ticket_id = f.ticket_id
      WHERE e.supervisor_id = ?
      GROUP BY e.employee_id
      LIMIT 5
    `, [employeeId]);
    
    const [recentReviews] = await pool.query(`
      SELECT sr.review_id, e.name as agent_name, t.issue_type, sr.status, sr.review_date
      FROM supervisor_reviews sr
      JOIN employees e ON sr.agent_id = e.employee_id
      JOIN tickets t ON sr.ticket_id = t.ticket_id
      WHERE sr.supervisor_id = ?
      ORDER BY sr.review_date DESC
      LIMIT 5
    `, [employeeId]);
    
    res.json({
      role: 'supervisor',
      scope: 'team_oversight',
      employee_id: employeeId,
      data: {
        team: {
          members: team[0].members || 0
        },
        reviews: {
          pending: reviews[0].pending || 0,
          completed: 12, // Mock completed reviews
          avg_time: 15, // Mock average review time
          approval_rate: 85 // Mock approval rate
        },
        quality: {
          score: Math.round(quality[0].score || 0),
          compliance_rate: 92, // Mock compliance rate
          error_rate: 8, // Mock error rate
          training_needed: 2 // Mock training needs
        },
        escalations: {
          total: escalations[0].total || 0
        },
        team_performance: teamPerformance,
        recent_reviews: recentReviews
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Follow-up Dashboard - Customer satisfaction data
exports.getFollowUpDashboard = async (req, res) => {
  try {
    const { employeeId } = req.dataScope;
    
    if (!employeeId) {
      return res.status(403).json({ error: 'Employee ID required for follow-up access' });
    }
    
    // Follow-up specialist gets customer satisfaction data
    const [followUps] = await pool.query(`
      SELECT COUNT(*) as completed
      FROM follow_ups WHERE follow_up_specialist_id = ? AND DATE(follow_up_date) = CURDATE()
    `, [employeeId]);
    
    const [pending] = await pool.query(`
      SELECT COUNT(*) as pending
      FROM follow_ups WHERE follow_up_specialist_id = ? AND status = 'pending'
    `, [employeeId]);
    
    const [satisfaction] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(satisfied = 1) as satisfied,
        SUM(satisfied = 0) as dissatisfied,
        SUM(satisfied IS NULL) as neutral
      FROM follow_ups 
      WHERE follow_up_specialist_id = ? AND DATE(follow_up_date) = CURDATE()
    `, [employeeId]);
    
    const [resolution] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(resolution_status = 'fully_resolved') as fully_resolved,
        SUM(resolution_status = 'partially_resolved') as partially_resolved,
        SUM(resolution_status = 'not_resolved') as not_resolved
      FROM follow_ups 
      WHERE follow_up_specialist_id = ? AND DATE(follow_up_date) = CURDATE()
    `, [employeeId]);
    
    const [recentFollowUps] = await pool.query(`
      SELECT f.follow_up_id, c.customer_name, c.customer_phone, t.ticket_id, f.satisfied, f.follow_up_date
      FROM follow_ups f
      JOIN tickets t ON f.ticket_id = t.ticket_id
      JOIN customers c ON t.customer_id = c.customer_id
      WHERE f.follow_up_specialist_id = ?
      ORDER BY f.follow_up_date DESC
      LIMIT 5
    `, [employeeId]);
    
    res.json({
      role: 'follow_up',
      scope: 'individual',
      employee_id: employeeId,
      data: {
        follow_ups: {
          completed: followUps[0].completed || 0,
          pending: pending[0].pending || 0
        },
        satisfaction: {
          rate: satisfaction[0].total > 0 ? Math.round((satisfaction[0].satisfied / satisfaction[0].total) * 100) : 0,
          satisfied: satisfaction[0].satisfied || 0,
          neutral: satisfaction[0].neutral || 0,
          dissatisfied: satisfaction[0].dissatisfied || 0
        },
        resolution: {
          rate: resolution[0].total > 0 ? Math.round((resolution[0].fully_resolved / resolution[0].total) * 100) : 0,
          fully_resolved: resolution[0].fully_resolved || 0,
          partially_resolved: resolution[0].partially_resolved || 0,
          not_resolved: resolution[0].not_resolved || 0
        },
        performance: {
          calls_made: followUps[0].completed || 0,
          avg_call_time: 8, // Mock average call time
          success_rate: 85 // Mock success rate
        },
        recent_follow_ups: recentFollowUps
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Generic Dashboard - Automatically routes to role-specific dashboard
exports.getGenericDashboard = async (req, res) => {
  try {
    const role = req.user?.system_role || req.dataScope?.systemRole || 'user';
    
    // Route to the appropriate dashboard based on user role
    switch (role) {
      case 'admin':
        return await exports.getAdminDashboard(req, res);
      case 'ceo':
        return await exports.getCeoDashboard(req, res);
      default:
        return await exports.getUserDashboard(req, res);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 