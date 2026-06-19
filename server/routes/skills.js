const express = require('express');
const router = express.Router();
const {
  addOfferedSkill,
  addWantedSkill,
  deleteOfferedSkill,
  deleteWantedSkill,
  updateOfferedSkill,
  updateWantedSkill,
} = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

router.post('/offered', protect, addOfferedSkill);
router.post('/wanted', protect, addWantedSkill);
router.delete('/offered/:skillId', protect, deleteOfferedSkill);
router.delete('/wanted/:skillId', protect, deleteWantedSkill);
router.put('/offered/:skillId', protect, updateOfferedSkill);
router.put('/wanted/:skillId', protect, updateWantedSkill);

module.exports = router;
