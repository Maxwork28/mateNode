const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../../middlewres/auth');

// User management routes (Admin only)
router.get('/', authMiddleware(['admin']), userController.getAllUsers);
router.get('/stats', authMiddleware(['admin']), userController.getUserStats);
router.get('/:id', authMiddleware(['admin']), userController.getUserById);
router.put('/:id/block', authMiddleware(['admin']), userController.blockUser);
router.put('/:id/unblock', authMiddleware(['admin']), userController.unblockUser);
router.put('/:id/toggle-status', authMiddleware(['admin']), userController.toggleUserStatus);

module.exports = router;
