import 'server-only';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get backendUrl(): string {
    return requireEnv('BACKEND_URL');
  },
  get sessionSecret(): string {
    return requireEnv('SESSION_SECRET');
  },
};
