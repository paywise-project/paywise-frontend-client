module.exports = {
  apps: [
    {
      name: "paywise",
      cwd: "/usr/share/nginx/paywise-frontend/paywise-frontend-client",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
