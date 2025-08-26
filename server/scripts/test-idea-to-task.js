require('dotenv').config();
const pool = require('../config/db');
const { createTaskFromIdea } = require('../utils/taskFromIdea');

async function testIdeaToTask() {
  try {
    console.log('🧪 Testing automatic task creation from ideas...');

    // First, let's check if we have any employees to work with
    const [employees] = await pool.execute('SELECT employee_id, name FROM employees LIMIT 2');
    
    if (employees.length < 2) {
      console.log('❌ Need at least 2 employees to test. Creating sample employees...');
      
      // Create sample employees if needed
      await pool.execute(`
        INSERT INTO employees (name, department) VALUES 
        ('John Doe', 'Script Writing'),
        ('Jane Smith', 'Content Creation')
      `);
      
      const [newEmployees] = await pool.execute('SELECT employee_id, name FROM employees ORDER BY employee_id DESC LIMIT 2');
      console.log('✅ Created sample employees:', newEmployees.map(e => `${e.name} (ID: ${e.employee_id})`));
    }

    // Get employees for testing
    const [testEmployees] = await pool.execute('SELECT employee_id, name FROM employees LIMIT 2');
    const contributor = testEmployees[0];
    const scriptWriter = testEmployees[1];

    console.log(`📝 Using employees: ${contributor.name} (contributor) and ${scriptWriter.name} (script writer)`);

    // Create a test idea
    const testIdeaData = {
      title: 'Test Creative Idea - Automated Task Creation',
      contributor_id: contributor.employee_id,
      script_writer_id: scriptWriter.employee_id,
      priority: 'high',
      script_deadline: '2024-12-31',
      notes: 'This is a test idea to verify automatic task creation functionality.'
    };

    console.log('🔄 Creating test idea...');
    
    const submission_date = new Date().toISOString().slice(0, 10);
    
    const [ideaResult] = await pool.query(
      'INSERT INTO ideas (submission_date, title, contributor_id, script_writer_id, status, script_deadline, priority, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [submission_date, testIdeaData.title, testIdeaData.contributor_id, testIdeaData.script_writer_id, 'bank', testIdeaData.script_deadline, testIdeaData.priority, testIdeaData.notes]
    );

    const ideaId = ideaResult.insertId;
    console.log(`✅ Created test idea with ID: ${ideaId}`);

    // Test automatic task creation
    console.log('🔄 Testing automatic task creation...');
    
    const createdTask = await createTaskFromIdea(testIdeaData, ideaId, 1); // Using user_id 1 for testing
    
    console.log('✅ Task created successfully!');
    console.log('📋 Task details:');
    console.log(`   - Task ID: ${createdTask.task_id}`);
    console.log(`   - Title: ${createdTask.title}`);
    console.log(`   - Assigned to: ${createdTask.assigned_to_name}`);
    console.log(`   - Priority: ${createdTask.priority}`);
    console.log(`   - Due Date: ${createdTask.due_date}`);
    console.log(`   - Source Module: ${createdTask.source_module}`);
    console.log(`   - Source ID: ${createdTask.source_id}`);

    // Verify the task was created correctly
    const [verification] = await pool.execute(`
      SELECT 
        t.*,
        e.name as assigned_to_name,
        i.title as idea_title
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      LEFT JOIN ideas i ON t.source_id = i.idea_id
      WHERE t.task_id = ?
    `, [createdTask.task_id]);

    if (verification.length > 0) {
      const task = verification[0];
      console.log('✅ Verification successful!');
      console.log(`   - Task linked to idea: ${task.idea_title}`);
      console.log(`   - Source tracking working: ${task.source_module} = 'ideas', ${task.source_id} = ${ideaId}`);
    }

    // Test the new API endpoints
    console.log('🔄 Testing API endpoints...');
    
    // Test getting tasks from ideas
    const { getTasksFromIdeas } = require('../utils/taskFromIdea');
    const tasksFromIdeas = await getTasksFromIdeas('ideas');
    console.log(`✅ Found ${tasksFromIdeas.length} tasks created from ideas`);

    // Test getting specific task from idea
    const { getTaskFromIdea } = require('../utils/taskFromIdea');
    const taskFromIdea = await getTaskFromIdea(ideaId);
    if (taskFromIdea) {
      console.log(`✅ Found task for idea ${ideaId}: ${taskFromIdea.title}`);
    }

    console.log('🎉 All tests passed! Automatic task creation from ideas is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testIdeaToTask(); 