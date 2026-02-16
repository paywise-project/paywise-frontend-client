module.exports = {
  apps: [
    {
      name: "paywise",
      cwd: "/var/www/paywise-frontend/app",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
