const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMediaController');

// Filtered endpoints
router.get('/status/:status', socialMediaController.getSocialMediaByStatus);
router.get('/content/:content_id', socialMediaController.getSocialMediaByContent);
router.get('/platform/:platform', socialMediaController.getSocialMediaByPlatform);
router.get('/post-type/:post_type', socialMediaController.getSocialMediaByPostType);
router.get('/approved/:approved', socialMediaController.getSocialMediaByApproved);

// Basic CRUD operations
router.post('/', socialMediaController.createSocialMedia);
router.get('/', socialMediaController.getAllSocialMedia);
router.get('/:id', socialMediaController.getSocialMediaById);
router.put('/:id', socialMediaController.updateSocialMedia);
router.delete('/:id', socialMediaController.deleteSocialMedia);

module.exports = router; 