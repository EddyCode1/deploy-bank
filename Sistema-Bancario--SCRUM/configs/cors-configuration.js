// Configuración de CORS (Cross-Origin Resource Sharing) para permitir peticiones desde otros dominios
const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const allowedOrigins = [
    ...configuredOrigins,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://localhost:5173',
    'https://localhost:3000',
    'https://*.vercel.app',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter(Boolean);

export const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some((allowedOrigin) => {
            if (allowedOrigin.includes('*')) {
                const pattern = new RegExp(`^${allowedOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*')}$`);
                return pattern.test(origin);
            }
            return allowedOrigin === origin;
        })) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-token', 'X-Token'],
};