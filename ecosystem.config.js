module.exports = {
  apps: [
    {
      name: 'telegram-chikchirik-3000',
      script: 'dist/main.js',
      instances: 'max', // кластерный режим = все ядра
      exec_mode: 'cluster',
      env: { NODE_ENV: 'development', PORT: 3000 },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        ADMIN: process.env.ADMIN,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
      },
    },
  ],
};
