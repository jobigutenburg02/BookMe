import client from "./client";

export const getPublicBusiness = (slug) => client.get(`/public/${slug}`)
export const getPublicSlots = (slug, params) => client.get(`/public/${slug}`, { params })
export const requestPublicBookingOtp = (slug, customerEmail) => client.post(`/public/${slug}/request-otp`, { customerEmail })
export const verifyPublicBookingOtp = (slug, data) => client.post(`/public/${slug}/verify-otp`, data)
export const createPublicBookingOtp = (slug, data) => client.post(`/public/${slug}/book`, data)
export const getPublicBookingStatus = (params) => client.get(`/public/booking/status`, { params })
export const cancelPublicBookingPayment = (bookingId) => client.get(`/public/booking/cancel-payment`, { booking_id: bookingId})

// Added alias with the expected name used by components/pages
export const createPublicBooking = (slug, data) => client.post(`/public/${slug}/book`, data)
