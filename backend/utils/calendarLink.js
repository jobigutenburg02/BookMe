const toGoogleDatetime = (date, time) => {
    return `${date.replaceAll('-', '')}T${time.replace(':', '')}00`
}

export const buildCustomerCalendarUrl = ({business, service, booking}) => {
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `${service.name} with ${business.businessName || business.name}`,
        dates: `${toGoogleDatetime(booking.date, booking.startTime)}/${toGoogleDatetime(booking.date, booking.endTime)}`,
        details: booking.notes || `Booking with ${business.businessName || business.name}`
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
}