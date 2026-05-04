const { spawn } = require("node:child_process");

const rawPort = process.env.PORT || "8081";
const port = /^\d+$/.test(rawPort) ? rawPort : "8081";
const env = { ...process.env };

if (env.REPLIT_EXPO_DEV_DOMAIN) {
  env.EXPO_PACKAGER_PROXY_URL =
    env.EXPO_PACKAGER_PROXY_URL || `https://${env.REPLIT_EXPO_DEV_DOMAIN}`;
}

if (env.REPLIT_DEV_DOMAIN) {
  env.EXPO_PUBLIC_DOMAIN = env.EXPO_PUBLIC_DOMAIN || env.REPLIT_DEV_DOMAIN;
  env.REACT_NATIVE_PACKAGER_HOSTNAME =
    env.REACT_NATIVE_PACKAGER_HOSTNAME || env.REPLIT_DEV_DOMAIN;
}

if (env.REPL_ID) {
  env.EXPO_PUBLIC_REPL_ID = env.EXPO_PUBLIC_REPL_ID || env.REPL_ID;
}

const isWindows = process.platform === "win32";
const child = isWindows
  ? spawn(`pnpm exec expo start --localhost --port ${port}`, {
      env,
      stdio: "inherit",
      shell: true,
    })
  : spawn("pnpm", ["exec", "expo", "start", "--localhost", "--port", port], {
      env,
      stdio: "inherit",
      shell: false,
    });

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
