import express from 'express';
const router = express.Router();
import * as socialMediaController from '../controllers/socialMediaController.js';

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

export default router; 