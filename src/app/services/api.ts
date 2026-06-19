import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

// ── Request interceptor — attach accessToken ─────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — handle 401 + silent refresh ──────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // If 401 and we haven't retried yet, attempt a token refresh
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        // The refresh-token is sent as httpOnly cookie (withCredentials: true),
        // so we just hit the endpoint — no need to send a body.
        const { data } = await axios.post(
          `${API_BASE}/auth/refresh-token`,
          {},
          { withCredentials: true }
        )

        const newAccessToken = data.data?.accessToken ?? data.accessToken
        localStorage.setItem('accessToken', newAccessToken)

        // Retry the original request with new token
        original.headers.Authorization = `Bearer ${newAccessToken}`
        return api(original)
      } catch {
        // Refresh failed → clear tokens and redirect to login
        localStorage.removeItem('accessToken')
        window.location.href = '/auth'
      }
    }

    return Promise.reject(error)
  }
)

export default api
