const express = require('express');
const router = express.Router();
const { getCompanyProfile, verifyCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getCompanyProfile);
router.post('/verify', protect, verifyCompany);

module.exports = router;
