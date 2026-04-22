export const DatabaseConfig = () => ({
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/pdv_updater',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});
