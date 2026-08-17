const Company = require('../models/Company');
const { verifyCompanyAPI } = require('../services/verificationService');

// @desc    Get company profile details
// @route   GET /api/company/profile
// @access  Private
const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.company.id);

    if (company) {
      res.json({
        id: company._id,
        name: company.name,
        registrationNumber: company.registrationNumber,
        pan: company.pan,
        email: company.email,
        phoneNumber: company.phoneNumber,
        address: company.address,
        verificationStatus: company.verificationStatus,
        verificationResult: company.verificationResult,
        verificationDate: company.verificationDate,
        createdAt: company.createdAt
      });
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Trigger third-party company verification
// @route   POST /api/company/verify
// @access  Private
const verifyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.company.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (company.verificationStatus === 'Verified') {
      return res.status(400).json({ message: 'Company is already verified' });
    }

    // Call third-party mock API
    const apiResult = await verifyCompanyAPI({
      name: company.name,
      registrationNumber: company.registrationNumber,
      pan: company.pan
    });

    if (apiResult.success) {
      company.verificationStatus = 'Verified';
      company.verificationResult = apiResult.details;
      company.verificationDate = Date.now();
      await company.save();

      return res.json({
        message: 'Verification successful',
        status: company.verificationStatus,
        details: company.verificationResult
      });
    } else {
      company.verificationStatus = 'Rejected';
      company.verificationResult = apiResult.details;
      company.verificationDate = Date.now();
      await company.save();

      return res.status(400).json({
        message: apiResult.message || 'Verification failed',
        status: company.verificationStatus,
        details: company.verificationResult
      });
    }
  } catch (error) {
    console.error('Verification Error:', error.message);
    
    // Save failed attempt status if applicable, or keep pending if it's a timeout/server error
    // For network/timeout errors, we probably want to keep it Pending so they can retry
    if (error.message.includes('timeout') || error.message.includes('unavailable')) {
       return res.status(503).json({ 
         message: 'Verification service is temporarily unavailable. Please try again later.',
         error: error.message
       });
    }

    res.status(500).json({ message: 'Server error during verification' });
  }
};

module.exports = {
  getCompanyProfile,
  verifyCompany
};
