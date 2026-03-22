import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
    }
});

apiClient.interceptors.request.use(config => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        const refreshToken = localStorage.getItem('refreshToken');

        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
            originalRequest._retry = true;

            try {
                const response = await axios.post('http://localhost:3000/api/auth/refresh', null, {
                    headers: {
                        'x-refresh-token': refreshToken
                    }
                });

                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        }

        return Promise.reject(error);
    }
);

export const api = {
    register: async payload => {
        const response = await apiClient.post('/auth/register', payload);
        return response.data;
    },
    login: async payload => {
        const response = await apiClient.post('/auth/login', payload);
        return response.data;
    },
    me: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
    getProducts: async () => {
        const response = await apiClient.get('/products');
        return response.data;
    },
    getProductById: async id => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },
    createProduct: async payload => {
        const response = await apiClient.post('/products', payload);
        return response.data;
    },
    updateProduct: async (id, payload) => {
        const response = await apiClient.put(`/products/${id}`, payload);
        return response.data;
    },
    deleteProduct: async id => {
        const response = await apiClient.delete(`/products/${id}`);
        return response.data;
    }
};
