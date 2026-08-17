/**
 * Mock Third-Party Company Verification Service
 * In a real application, this would call an external API (e.g., using axios).
 */

const verifyCompanyAPI = async (companyData) => {
  // Read API key from environment variables as required by project specs
  const apiKey = process.env.THIRD_PARTY_API_KEY;
  if (!apiKey) {
    console.warn('Warning: THIRD_PARTY_API_KEY is not set in environment variables');
  }

  // Simulate network latency (1-3 seconds)
  const delay = Math.floor(Math.random() * 2000) + 1000;
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const { registrationNumber, pan } = companyData;
        
        // Simulate a timeout error
        if (registrationNumber === 'TIMEOUT123') {
          return reject(new Error('Third-party API timeout'));
        }

        // Simulate API failure (e.g., 500 error)
        if (registrationNumber === 'FAIL123') {
          return reject(new Error('Third-party API failure: Service unavailable'));
        }

        // Simulate failed verification (invalid details)
        // If PAN starts with 'INV' or RegNo starts with 'INV', we fail it
        if (pan.startsWith('INV') || registrationNumber.startsWith('INV')) {
          return resolve({
            success: false,
            message: 'Company details could not be verified with government records.',
            details: { reason: 'Invalid registration number or PAN' }
          });
        }

        // Simulate successful verification
        resolve({
          success: true,
          message: 'Company successfully verified.',
          details: {
            verifiedName: companyData.name.toUpperCase(),
            verifiedPan: pan,
            status: 'ACTIVE',
            dateOfIncorporation: '2010-05-15'
          }
        });
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
};

module.exports = {
  verifyCompanyAPI
};
