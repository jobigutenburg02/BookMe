import client from "./client";

export const listServices = () => client.get('/services')
export const createService = (data) => client.post('/services', data)
export const updateService = (id, data) => client.patch(`/services/${id}`, data)
export const deleteService = (id) => client.delete(`/services/${id}`)