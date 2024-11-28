
module.exports = {
  baseUrl: process.env.BASE_URL,
  database: {
    uri: process.env.DATABASE_URI,
  },
  jwt: {
    accessToken: {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      ttl: "1d",
    },
    refreshToken: {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      ttl: "7 days",
      remeberMeTTL: "30 days",
      redisTTL: 7 * 86400, // 7 days
      redisRemeberMeTTL: 30 * 86400, //days
    },
    emailVerificationToken: {
      secret: process.env.JWT_EMAIL_VERIFICATION_TOKEN_SECRET,
      ttl: 1800,
    },
    issuer: "rain.com",
  },
  redis: {
    host: process.env.REDIS_HOST,
  },
  maxEventListeners: 10,

  defaultAvatarImage: process.env.DEFAULT_AVATAR_URL,
};
