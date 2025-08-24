const request = require('supertest');
const mysql = require('mysql2/promise');
const app = require('../app');

// Test database configuration
const testDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'test_user',
  password: process.env.DB_PASSWORD || 'test_password',
  database: process.env.TEST_DB_NAME || 'test_nasiye_tasks'
};

describe('Content Production Pipeline Integration Tests', () => {
  let connection;
  let authToken;
  let testIdeaId;

  beforeAll(async () => {
    // Create test database connection
    connection = await mysql.createConnection(testDbConfig);
    
    // Clean up any existing test data
    await connection.execute('DELETE FROM social_media WHERE 1=1');
    await connection.execute('DELETE FROM production WHERE 1=1');
    await connection.execute('DELETE FROM content WHERE 1=1');
    await connection.execute('DELETE FROM ideas WHERE title LIKE "Test Pipeline%"');
    
    // Create test user and get auth token
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    if (connection) {
      await connection.execute('DELETE FROM social_media WHERE 1=1');
      await connection.execute('DELETE FROM production WHERE 1=1');
      await connection.execute('DELETE FROM content WHERE 1=1');
      await connection.execute('DELETE FROM ideas WHERE title LIKE "Test Pipeline%"');
      await connection.end();
    }
  });

  describe('Stage Inference Logic', () => {
    test('should correctly infer stage for new idea', async () => {
      // Create a test idea
      const ideaResponse = await request(app)
        .post('/api/ideas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Pipeline Idea 1',
          contributor_id: 1,
          script_writer_id: 1,
          priority: 'high'
        });

      expect(ideaResponse.status).toBe(201);
      testIdeaId = ideaResponse.body.idea_id;

      // Check that it appears in Idea stage
      const ideasResponse = await request(app)
        .get('/api/ideas?stage=Idea')
        .set('Authorization', `Bearer ${authToken}`);

      expect(ideasResponse.status).toBe(200);
      const idea = ideasResponse.body.find(i => i.idea_id === testIdeaId);
      expect(idea).toBeDefined();
      expect(idea.stage).toBe('Idea');
      expect(idea.canMoveForward).toBe(true);
    });

    test('should move from Idea to Script stage', async () => {
      const moveResponse = await request(app)
        .post(`/api/ideas/${testIdeaId}/move-forward`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          note: 'Moving to script stage for testing'
        });

      expect(moveResponse.status).toBe(200);
      expect(moveResponse.body.success).toBe(true);
      expect(moveResponse.body.stage_transition).toBe('Idea -> Script');
      expect(moveResponse.body.content_id).toBeDefined();

      // Verify it no longer appears in Idea stage
      const ideasResponse = await request(app)
        .get('/api/ideas?stage=Idea')
        .set('Authorization', `Bearer ${authToken}`);

      const idea = ideasResponse.body.find(i => i.idea_id === testIdeaId);
      expect(idea).toBeUndefined();

      // Verify it appears in Script stage
      const scriptsResponse = await request(app)
        .get('/api/ideas?stage=Script')
        .set('Authorization', `Bearer ${authToken}`);

      const script = scriptsResponse.body.find(s => s.idea_id === testIdeaId);
      expect(script).toBeDefined();
      expect(script.stage).toBe('Script');
      expect(script.content_id).toBeDefined();
    });

    test('should move from Script to Production stage', async () => {
      const moveResponse = await request(app)
        .post(`/api/ideas/${testIdeaId}/move-forward`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          note: 'Moving to production stage for testing'
        });

      expect(moveResponse.status).toBe(200);
      expect(moveResponse.body.success).toBe(true);
      expect(moveResponse.body.stage_transition).toBe('Script -> Production');
      expect(moveResponse.body.production_id).toBeDefined();

      // Verify it appears in Production stage
      const productionResponse = await request(app)
        .get('/api/ideas?stage=Production')
        .set('Authorization', `Bearer ${authToken}`);

      const production = productionResponse.body.find(p => p.idea_id === testIdeaId);
      expect(production).toBeDefined();
      expect(production.stage).toBe('Production');
      expect(production.production_id).toBeDefined();
    });

    test('should move from Production to Social stage', async () => {
      const moveResponse = await request(app)
        .post(`/api/ideas/${testIdeaId}/move-forward`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          note: 'Moving to social stage for testing'
        });

      expect(moveResponse.status).toBe(200);
      expect(moveResponse.body.success).toBe(true);
      expect(moveResponse.body.stage_transition).toBe('Production -> Social');
      expect(moveResponse.body.social_post_id).toBeDefined();

      // Verify it appears in Social stage
      const socialResponse = await request(app)
        .get('/api/ideas?stage=Social')
        .set('Authorization', `Bearer ${authToken}`);

      const social = socialResponse.body.find(s => s.idea_id === testIdeaId);
      expect(social).toBeDefined();
      expect(social.stage).toBe('Social');
      expect(social.social_post_id).toBeDefined();
    });

    test('should publish from Social stage', async () => {
      const moveResponse = await request(app)
        .post(`/api/ideas/${testIdeaId}/move-forward`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          note: 'Publishing for testing'
        });

      expect(moveResponse.status).toBe(200);
      expect(moveResponse.body.success).toBe(true);
      expect(moveResponse.body.stage_transition).toBe('Social -> Published');

      // Verify social media record is updated
      const [socialRecords] = await connection.execute(
        'SELECT * FROM social_media sm JOIN content c ON sm.content_id = c.content_id WHERE c.idea_id = ?',
        [testIdeaId]
      );

      expect(socialRecords.length).toBe(1);
      expect(socialRecords[0].status).toBe('published');
      expect(socialRecords[0].approved).toBe(1);
    });
  });

  describe('Idempotency Tests', () => {
    let duplicateTestIdeaId;

    beforeAll(async () => {
      // Create another test idea for idempotency testing
      const ideaResponse = await request(app)
        .post('/api/ideas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Pipeline Idea 2 - Idempotency',
          contributor_id: 1,
          script_writer_id: 1,
          priority: 'medium'
        });

      duplicateTestIdeaId = ideaResponse.body.idea_id;
    });

    test('should prevent duplicate content creation', async () => {
      // Move to Script stage
      const firstMove = await request(app)
        .post(`/api/ideas/${duplicateTestIdeaId}/move-forward`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ note: 'First move' });

      expect(firstMove.status).toBe(200);

      // Try to move again - should fail with ALREADY_EXISTS
      const secondMove = await request(app)
        .post(`/api/ideas/${duplicateTestIdeaId}/move-forward`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ note: 'Second move attempt' });

      expect(secondMove.status).toBe(409);
      expect(secondMove.body.error).toBe('ALREADY_EXISTS');
    });

    test('should handle concurrent move attempts gracefully', async () => {
      // Create a fresh idea for concurrency testing
      const ideaResponse = await request(app)
        .post('/api/ideas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Pipeline Idea 3 - Concurrency',
          contributor_id: 1,
          script_writer_id: 1,
          priority: 'low'
        });

      const concurrentTestIdeaId = ideaResponse.body.idea_id;

      // Attempt concurrent moves
      const promises = Array(3).fill().map(() =>
        request(app)
          .post(`/api/ideas/${concurrentTestIdeaId}/move-forward`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ note: 'Concurrent move' })
      );

      const results = await Promise.allSettled(promises);
      
      // Only one should succeed, others should fail
      const successes = results.filter(r => r.status === 'fulfilled' && r.value.status === 200);
      const failures = results.filter(r => r.status === 'fulfilled' && r.value.status === 409);

      expect(successes.length).toBe(1);
      expect(failures.length).toBe(2);
    });
  });

  describe('Validation Tests', () => {
    test('should validate idea title before moving', async () => {
      // Create idea with empty title
      const [result] = await connection.execute(
        'INSERT INTO ideas (submission_date, title, contributor_id, script_writer_id, status, priority) VALUES (CURDATE(), "", 1, 1, "pending", "medium")'
      );

      const emptyTitleIdeaId = result.insertId;

      const moveResponse = await request(app)
        .post(`/api/ideas/${emptyTitleIdeaId}/move-forward`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ note: 'Should fail validation' });

      expect(moveResponse.status).toBe(400);
      expect(moveResponse.body.error).toBe('MISSING_PREREQUISITE');
    });

    test('should check validation endpoint', async () => {
      const validationResponse = await request(app)
        .get(`/api/ideas/${testIdeaId}/validation`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(validationResponse.status).toBe(200);
      expect(validationResponse.body.idea_id).toBe(testIdeaId);
      expect(validationResponse.body.stage).toBeDefined();
      expect(validationResponse.body.canMoveForward).toBeDefined();
      expect(validationResponse.body.validationErrors).toBeDefined();
    });
  });

  describe('Detail View Tests', () => {
    test('should return complete idea details with all stages', async () => {
      const detailResponse = await request(app)
        .get(`/api/ideas/${testIdeaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(detailResponse.status).toBe(200);
      
      const details = detailResponse.body;
      expect(details.idea).toBeDefined();
      expect(details.content).toBeDefined();
      expect(details.production).toBeDefined();
      expect(details.social_media).toBeDefined();
      expect(details.stage).toBe('Social'); // Should be in final stage after all moves
      expect(details.canMoveForward).toBeDefined();
    });
  });
});

module.exports = {
  testDbConfig
};