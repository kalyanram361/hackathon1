import axios from "axios";
console.log('VITE_SERVER_URL:', import.meta.env.VITE_SERVER_URL);
const api = axios.create({
    baseURL: `${import.meta.env.VITE_SERVER_URL}/auth`,
});

export default api;