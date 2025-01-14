export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default_secret', // Replace with a secure secret
  expiresIn: '24h', // Token expiration time
  algorithm: 'HS256', // Hashing algorithm
};
