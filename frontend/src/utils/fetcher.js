import axios from 'axios';

const cookies = document.cookie.split(';');
let sessionCookie = cookies.find((cookie) => cookie.startsWith('smovSessionID'));
    
if (sessionCookie && sessionCookie.includes('=')) {
    sessionCookie = sessionCookie.split('=')[1];
} else {
    sessionCookie = null;
}

const fetcher = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: {
        "Accept": "application/json",
        "Authorization": sessionCookie ? `Bearer ${sessionCookie}` : "",
    },
});

fetcher.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default fetcher;
