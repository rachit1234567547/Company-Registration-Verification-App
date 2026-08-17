const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company Name is required']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration Number is required'],
    unique: true
  },
  pan: {
    type: String,
    required: [true, 'PAN is required'],
    unique: true,
    uppercase: true,
    match: [
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      'Please enter a valid PAN format (e.g., ABCDE1234F)'
    ]
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone Number is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ],
    select: false // Do not return password by default
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  verificationResult: {
    type: Object,
    default: null
  },
  verificationDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
companySchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
companySchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Company', companySchema);
