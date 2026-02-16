module.exports = {
  apps: [
    {
      name: "paywise",
      cwd: "/var/www/paywise-frontend/app",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
