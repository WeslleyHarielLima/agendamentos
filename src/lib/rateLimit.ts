import { RateLimiterMemory } from 'rate-limiter-flexible';

const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 900, // 15 minutos
});

export async function checkLoginRateLimit(ip: string): Promise<void> {
  try {
    await loginLimiter.consume(ip);
  } catch {
    throw new Error('Muitas tentativas. Tente novamente em 15 minutos.');
  }
}
