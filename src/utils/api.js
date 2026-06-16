import axios from 'axios'
import { useAuthStore } from '@/store'

// const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const BASE_URL = 'https://manga-cafe-backend.onrender.com/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - auto refresh token
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }
      originalRequest._retry = true
      isRefreshing = true
      const { refreshToken, setTokens, logout } = useAuthStore.getState()
      try {
        const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh: refreshToken })
        const { access } = res.data
        setTokens(access, refreshToken)
        processQueue(null, access)
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        logout()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ── API helper functions ─────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  profile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.post('/auth/change-password/', data),
  follow: (username) => api.post(`/auth/${username}/follow/`),
  getUser: (username) => api.get(`/auth/${username}/`),
}

export const webtoonAPI = {
  getGenres: () => api.get('/webtoons/genres/'),
  getSeries: (params) => api.get('/webtoons/series/', { params }),
  getTrending: () => api.get('/webtoons/series/trending/'),
  getPopular: () => api.get('/webtoons/series/popular/'),
  getBySchedule: (day) => api.get(`/webtoons/series/schedule/${day}/`),
  search: (q) => api.get('/webtoons/search/', { params: { q } }),
  getSeriesDetail: (slug) => api.get(`/webtoons/series/${slug}/`),
  createSeries: (data) => api.post('/webtoons/series/create/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  likeSeries: (slug) => api.post(`/webtoons/series/${slug}/like/`),
  getEpisodes: (slug, params) => api.get(`/webtoons/series/${slug}/episodes/`, { params }),
  getEpisode: (slug, num) => api.get(`/webtoons/series/${slug}/episodes/${num}/`),
  unlockEpisode: (id) => api.post(`/webtoons/episodes/${id}/unlock/`),
  likeEpisode: (id) => api.post(`/webtoons/episodes/${id}/like/`),
  updateProgress: (slug, data) => api.post(`/webtoons/series/${slug}/progress/`, data),
  getHistory: () => api.get('/webtoons/history/'),
  createEpisode: (slug, data) => api.post(`/webtoons/series/${slug}/episodes/create/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

export const animeAPI = {
  getGenres: () => api.get('/anime/genres/'),
  getSeries: (params) => api.get('/anime/series/', { params }),
  getTrending: () => api.get('/anime/series/trending/'),
  getFeatured: () => api.get('/anime/series/featured/'),
  search: (q) => api.get('/anime/search/', { params: { q } }),
  getSeriesDetail: (slug) => api.get(`/anime/series/${slug}/`),
  likeSeries: (slug) => api.post(`/anime/series/${slug}/like/`),
  getEpisode: (slug, num) => api.get(`/anime/series/${slug}/episodes/${num}/`),
  unlockEpisode: (id) => api.post(`/anime/episodes/${id}/unlock/`),
  updateWatchPosition: (slug, data) => api.post(`/anime/series/${slug}/watch-position/`, data),
  getHistory: () => api.get('/anime/history/'),
  uploadEpisode: (slug, data) => api.post(`/anime/series/${slug}/episodes/upload/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

export const reviewAPI = {
  getReviews: (type, id) => api.get(`/reviews/${type}/${id}/`),
  create: (data) => api.post('/reviews/create/', data),
  update: (id, data) => api.put(`/reviews/${id}/`, data),
  delete: (id) => api.delete(`/reviews/${id}/`),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful/`),
}

export const bookmarkAPI = {
  getAll: (type) => api.get('/bookmarks/', { params: type ? { type } : {} }),
  toggle: (seriesId, seriesType) => api.post('/bookmarks/toggle/', { series_id: seriesId, series_type: seriesType }),
}

export const coinAPI = {
  getWallet: () => api.get('/coins/wallet/'),
  getTransactions: () => api.get('/coins/transactions/'),
  getPackages: () => api.get('/coins/packages/'),
}

export const dashboardAPI = {
  getAuthorDashboard: () => api.get('/dashboard/author/'),
  getReaderDashboard: () => api.get('/dashboard/reader/'),
}
