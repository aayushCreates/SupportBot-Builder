import rateLimit from 'express-rate-limit';


export const chatRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20,
  message: {
    error: 'Too many chat requests from this IP, please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
