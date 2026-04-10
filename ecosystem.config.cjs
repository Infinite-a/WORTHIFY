module.exports = {
  apps: [
    {
      name: 'worthify',
      script: 'python3',
      args: 'backend/app.py',
      cwd: '/home/user/webapp',
      env: {
        FLASK_ENV: 'production',
        JWT_SECRET_KEY: 'worthify-ultra-secret-jwt-key-2024-prod',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 3000,
      max_restarts: 5
    }
  ]
}
