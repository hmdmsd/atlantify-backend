export const apiConfig = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
  wsUrl: process.env.WS_BASE_URL || 'ws://localhost:4000',
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
    },
    musicBox: {
      suggestions: '/musicbox/suggestions',
      vote: (id: string) => `/musicbox/suggestions/${id}/vote`,
    },
    radio: {
      queue: '/radio/queue',
      current: '/radio/current',
      next: '/radio/next',
    },
    songs: {
      upload: '/songs/upload',
      list: '/songs',
      details: (id: string) => `/songs/${id}`,
    },
  },
  headers: {
    'Content-Type': 'application/json',
  },
};
