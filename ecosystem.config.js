module.exports = {
  apps: [
    {
      name: 'telegram-chikchirik-3000',
      script: 'dist/main.js',
      instances: 'max',        // кластерный режим = все ядра
      exec_mode: 'cluster',
      env: { NODE_ENV: 'development', PORT: 3000 },
      env_production: { NODE_ENV: 'production', PORT: 3000 }
    }
  ]
};
