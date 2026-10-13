import axios from 'axios'

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

console.log('[client] VITE_API_URL =', import.meta.env.VITE_API_URL)
console.log('[client] baseURL fallback =', 'http://localhost:5000/api')

client.interceptors.request.use((config) => {
    console.log('[client] REQUEST → baseURL:', config.baseURL, '| url:', config.url)
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

client.interceptors.response.use(
    (response) => {
        const token = response.data?.token
        if (token) {
            localStorage.setItem('token', token)
        }
        return response
    },
    (error) => {
        const url = error.config?.url || ''
        const wasAuthenticated = Boolean(error.config?.headers?.Authorization)
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')

        if (error.response?.status === 401 && wasAuthenticated && !isAuthEndpoint) {
            localStorage.removeItem('token')
            window.location.assign('/login')
        }
        return Promise.reject(error)
    }
)

export default client