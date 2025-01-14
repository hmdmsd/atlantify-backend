"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiConfig = void 0;
exports.apiConfig = {
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
            vote: (id) => `/musicbox/suggestions/${id}/vote`,
        },
        radio: {
            queue: '/radio/queue',
            current: '/radio/current',
            next: '/radio/next',
        },
        songs: {
            upload: '/songs/upload',
            list: '/songs',
            details: (id) => `/songs/${id}`,
        },
    },
    headers: {
        'Content-Type': 'application/json',
    },
};
