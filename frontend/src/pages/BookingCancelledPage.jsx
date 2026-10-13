import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cancelPublicBookingPayment } from "../api/public";
import { XCircle, ArrowLeft } from "lucide-react";
import { bookingCancelledPageStyles as s } from "../assets/dummyStyles";

export default function BookingCancelledPage(){
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const bookingId = searchParams.get('booking_id')
        if(bookingId){
            cancelPublicBookingPayment(bookingId).catch(() => {})
        }
    }, [searchParams])

    return (
        <div className={s.container}>
            <main className={s.card}>
                <div className={s.iconCircle}>
                    <XCircle className={s.icon} />
                </div>
                <p className={s.statusLabel}>Payment cancelled</p>
                <h1 className={s.heading}>Your booking was not confirmed</h1>
                <p className={s.description}>
                    No payment was completed. You can return to the booking page
                    and choose a slot again.
                </p>
                <Link to={searchParams.get('slug') ? `/book/${searchParams.get('slug')}` : '/'} className={s.homeLink}>
                   <ArrowLeft className={s.homeLinkIcon} />
                   Back to Booking Page
                </Link>
            </main>
        </div>
    )
}