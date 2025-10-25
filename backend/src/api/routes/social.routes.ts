import { Router } from 'express';
import { socialController } from '../controllers/social.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Timelines
router.get('/timelines/home', authenticate, socialController.getHomeTimeline);
router.get('/timelines/public', optionalAuthenticate, socialController.getPublicTimeline);

// Statuses
router.get('/statuses/:id', optionalAuthenticate, socialController.getStatus);
router.post('/statuses', authenticate, socialController.createStatus);
router.delete('/statuses/:id', authenticate, socialController.deleteStatus);

// Favourites
router.post('/statuses/:id/favourite', authenticate, socialController.favouriteStatus);
router.post('/statuses/:id/unfavourite', authenticate, socialController.unfavouriteStatus);

// Accounts
router.get('/accounts/verify_credentials', authenticate, socialController.verifyCredentials);
router.get('/accounts/:id', optionalAuthenticate, socialController.getAccount);

export default router;
