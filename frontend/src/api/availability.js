import client from "./client";

export const listAvailability = () => client.get('/availability')
export const saveAvailability = (data) => client.put('/availability', data)
