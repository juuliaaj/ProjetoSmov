import axios from 'axios';

const fetcher = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: {
        "Accept": "application/json",
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
