import client from './client'

console.log('[auth.js] client is:', client) 

export const register = (data) => client.post('/auth/register', data)
export const requestRegistrationOtp = (email) => client.post('/auth/register/request-otp', { email })
export const verifyRegistrationOtp = (data) => client.post('/auth/register/verify-otp', data)
export const login = (data) => client.post('/auth/login', data)
export const getMe = () => client.get('/auth/me')
export const updateProfile = (data) => client.put('/auth/profile', data)