import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

export const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { userId, purpose: 'password-reset' },
    process.env.RESET_PASSWORD_SECRET,
    { expiresIn: process.env.RESET_PASSWORD_EXPIRY || '1h' }
  );
};

export const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    if (decoded.purpose !== 'password-reset') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};
