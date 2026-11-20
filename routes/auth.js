import express from 'express';

import * as controller from '../controllers/auth.js';

const router = express.Router();

router.get('/github', controller.login);
router.get('/github/callback', controller.callback);
router.get('/auth/me', controller.me);
router.post('/auth/logout', controller.logout);

export default router;
