const generateOTP = (length) => {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error('Length must be a positive integer.');
    }
    
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
};

module.exports = generateOTP;
