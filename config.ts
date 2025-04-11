// Verificar que las variables de entorno requeridas estén definidas
const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL", "XML_FEED_URL"] as const;

// for (const envVar of requiredEnvVars) {
//   if (!process.env[envVar]) {
//     throw new Error(`La variable de entorno ${envVar} es requerida`);
//   }
// }

export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
export const REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
export const SALT_ROUNDS = 10; // Rondas de sal para bcrypt
