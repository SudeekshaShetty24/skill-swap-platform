const express = require('express');
const router = express.Router();
const { getUsers, updateProfile, getUserById, connectUser, deleteProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUsers);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteProfile);
router.get('/:id', protect, getUserById);
router.post('/connect/:id', protect, connectUser);

module.exports = router;
