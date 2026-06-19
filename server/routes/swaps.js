const express = require('express');
const router = express.Router();
const {
  createSwap, getMySwaps, getSwap,
  updateStatus, addResource, deleteResource,
  addSession, updateSession, updateProgress, updateNotes,
} = require('../controllers/swapController');
const { protect } = require('../middleware/auth');

router.post('/',                              protect, createSwap);
router.get('/',                               protect, getMySwaps);
router.get('/:id',                            protect, getSwap);
router.put('/:id/status',                     protect, updateStatus);
router.post('/:id/resources',                 protect, addResource);
router.delete('/:id/resources/:resourceId',   protect, deleteResource);
router.post('/:id/sessions',                  protect, addSession);
router.put('/:id/sessions/:sessionId',        protect, updateSession);
router.put('/:id/progress',                   protect, updateProgress);
router.put('/:id/notes',                      protect, updateNotes);

module.exports = router;
