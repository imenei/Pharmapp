module.exports = {
  apps: [
    {
      name: 'pharmapp-backend',
      cwd: '/var/www/pharmapp/current/backend',
      script: 'npm',
      args: 'run start:prod',
      env_file: '/var/www/pharmapp/shared/config/backend.env',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      time: true,
    },
    {
      name: 'pharmapp-frontend',
      cwd: '/var/www/pharmapp/current/frontend',
      script: 'npm',
      args: 'run start -- --hostname 127.0.0.1 --port 3000',
      env_file: '/var/www/pharmapp/shared/config/frontend.env',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      time: true,
    },
  ],
};
