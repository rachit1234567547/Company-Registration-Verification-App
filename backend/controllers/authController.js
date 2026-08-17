const Company = require('../models/Company');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new company
// @route   POST /api/auth/register
// @access  Public
const registerCompany = async (req, res) => {
  try {
    const { name, registrationNumber, pan, email, phoneNumber, address, password } = req.body;

    // Check if company already exists (by email, PAN or RegNo)
    const companyExists = await Company.findOne({
      $or: [{ email }, { registrationNumber }, { pan }]
    });

    if (companyExists) {
      let field = 'Company';
      if (companyExists.email === email) field = 'Email';
      else if (companyExists.pan === pan) field = 'PAN';
      else if (companyExists.registrationNumber === registrationNumber) field = 'Registration Number';
      
      return res.status(400).json({ message: `${field} already registered` });
    }

    // Create company
    const company = await Company.create({
      name,
      registrationNumber,
      pan,
      email,
      phoneNumber,
      address,
      password, // Password hashed in pre-save middleware
    });

    if (company) {
      res.status(201).json({
        message: 'Company registered successfully'
      });
    } else {
      res.status(400).json({ message: 'Invalid company data' });
    }
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a company
// @route   POST /api/auth/login
// @access  Public
const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for company email and include password for comparison
    const company = await Company.findOne({ email }).select('+password');

    if (company && (await company.matchPassword(password))) {
      res.json({
        _id: company.id,
        name: company.name,
        email: company.email,
        verificationStatus: company.verificationStatus,
        token: generateToken(company._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerCompany,
  loginCompany,
};
