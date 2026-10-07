// Vacío en producción: el navegador llama a /api/... en el mismo dominio y Vercel
// enruta al servicio "api". En dev, Vite proxea /api hacia el backend local.
export const API_URL = import.meta.env.VITE_API_URL ?? '';
