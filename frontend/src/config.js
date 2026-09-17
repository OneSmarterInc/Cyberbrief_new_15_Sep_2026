// Vite pulls environment variables from the .env file using import.meta.env
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api";