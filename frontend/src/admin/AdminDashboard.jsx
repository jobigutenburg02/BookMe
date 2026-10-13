import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminDashboard, updateWithdrawalStatus } from "../api/admin";
import {
    Users,
    Wallet,
    TrendingUp,
    IndianRupee,
    Landmark,
    CheckCircle,
    XOctagon,
    Clock,
    UserCheck,
    ShieldCheck
} from "lucide-react"
import logo from "../assets/logo.png"
import { adminDashboardPageStyles as s } from "../assets/dummyStyles";

const formatMoney = (amount = 0, currency = "INR") => {
    new Intl.NumberFormat("en-IN", { styles: "currency", currency }).format(
        amount / 100
    )
}

const withdrawalStatuses = ["processing", "paid", "rejected"]
const terminalWithdrawalStatuses = ["paid", "rejected"]

const isTerminalWithdrawalStatus = (status) => {
    terminalWithdrawalStatuses.includes(status)
}

const formatStatusLabel = (status = "") => {
    status ? `${status.slice(0, 1).toUpperCase()}${status.slice(1)}` : ""
}

export default function AdminDashboardPage() {
    const navigate = useNavigate()
    const [dashboard, setDashboard] = useState(null)
    const [message, setMessage] = useState("")
    const [updatingWithdrawalId, setUpdatingWithdrawalId] = useState("")
    const [pendingWithdrawalAction, setPendingWithdrawalAction] = useState(null)

    useEffect(() => {
        if (!localStorage.getItem("adminToken")) {
            navigate("/admin/login")
            return undefined
        }

        let isActive = true
        getAdminDashboard()
            .then(({ data }) => {
                if (isActive) {
                    setDashboard(data)
                }
            })
            .catch((error) => {
                if (isActive) {
                    setMessage(
                        error.response?.data?.message || "Could not load admin dashboard"
                    )
                }
            })

        return () => {
            isActive = false
        }
    }, [navigate])

    const requestWithdrawalStatusChange = (withdrawal, status) => {
        if (
            withdrawal.status === status ||
            isTerminalWithdrawalStatus(withdrawal.status)
        ) {
            return
        }

        setPendingWithdrawalAction({ withdrawal, status })
    }

    const closeWithdrawalConfirm = () => {
        if (updatingWithdrawalId) return
        setPendingWithdrawalAction(null)
    }

    const changeWithdrawalStatus = async () => {
        if (!pendingWithdrawalAction) return;

        const { withdrawal, status } = pendingWithdrawalAction;
        setUpdatingWithdrawalId(withdrawal._id);

        try {
            const { data } = await updateWithdrawalStatus(withdrawal._id, { status });
            setDashboard((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    summary: data.summary || prev.summary,
                    withdrawals: prev.withdrawals.map((withdrawal) =>
                        withdrawal._id === data.withdrawal._id
                            ? data.withdrawal
                            : withdrawal,
                    ),
                };
            });
            setMessage(data.message || `Withdrawal marked as ${status}`);
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Could not update withdrawal",
            );
        } finally {
            setUpdatingWithdrawalId("");
            setPendingWithdrawalAction(null);
        }
    };

    const logout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    const summary = dashboard?.summary || {};
    const pendingWithdrawal = pendingWithdrawalAction?.withdrawal;
    const WithdrawalConfirmIcon =
        pendingWithdrawalAction?.status === "rejected" ? XOctagon : ShieldCheck;
    const isConfirmingWithdrawal =
        pendingWithdrawal && updatingWithdrawalId === pendingWithdrawal._id;

    // Helpers for dynamic classes from styles
    const getPayoutStatusClass = (isComplete) =>
        isComplete ? s.userPayoutReady : s.userPayoutPending;

    const getWithdrawalStatusClass = (status) =>
        s.withdrawalStatusColors[status] || s.withdrawalStatusDefault;

    const statCards = [
        {
            label: "Total Users",
            value: summary.users || 0,
            icon: Users,
            bg: s.statBg1,
            c: s.statColor1,
        },
        {
            label: "Paid Bookings",
            value: summary.paidBookings || 0,
            icon: CheckCircle,
            bg: s.statBg2,
            c: s.statColor2,
        },
        {
            label: "Gross Revenue",
            value: formatMoney(summary.grossRevenue),
            icon: TrendingUp,
            bg: s.statBg3,
            c: s.statColor3,
        },
        {
            label: "Platform Fees",
            value: formatMoney(summary.platformFees),
            icon: IndianRupee,
            bg: s.statBg4,
            c: s.statColor4,
        },
        {
            label: "Provider Payouts",
            value: formatMoney(summary.providerPayouts),
            icon: Wallet,
            bg: s.statBg5,
            c: s.statColor5,
        },
        {
            label: "Withdrawal Hold",
            value: formatMoney(summary.withdrawalHolds),
            icon: Landmark,
            bg: s.statBg6,
            c: s.statColor6,
        },
    ];

    return (
        <div className={s.pageContainer}>
            <header className={s.header}>
                <div className={s.headerInner}>
                    <div className={s.logoRow}>
                        <img src={logo} className={s.logoImg} />
                        <Link to="/admin/dashboard" className={s.logoText}>
                            BookMe <span className={s.logoAccent}>Admin</span>
                        </Link>
                    </div>
                    <div className={s.headerActions}>
                        <Link to="/" className={s.clientAppLink}>
                          Client App
                        </Link>
                        <button type="button" onClick={logout} className={s.logoutButton}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            <main className={s.main}>
                <section className={s.heroSection}>
                    <div>
                        <h1 className={s.heroTitle}>
                            Platform <span className={s.heroTitleAccent}>Overview</span>
                        </h1>
                        <p className={s.heroSubtitle}>
                            Users, bookings, revenue, and active withdrawals.
                        </p>
                    </div>
                    {message && <div className={s.messageBanner}>{message}</div>}
                </section>
                <section className={s.statsGrid}>
                    {statCards.map((stat, i) => (
                        <div key={i} className={s.statCard}>
                            <div className={`${s.statIconContainer} ${stat.bg} ${stat.c}`}>
                                <stat.icon className={s.statIcon} />
                            </div>
                            <div>
                                <p className={s.statLabel}>
                                    {stat.label}
                                </p>
                                <h2 className={s.statValue}>
                                    {stat.value}
                                </h2>
                            </div>
                        </div>
                    ))}
                </section>
                <section className={s.tablesGrid}>
                    <div className={s.tableCard}>
                        <div className={s.tableHeader}>
                            <h2 className={s.tableTitle}>
                                <UserCheck className={s.tableTitleIcon} /> Registered Users
                            </h2>
                        </div>
                        <div className={s.tableScrollContainer}>
                            <table className={s.table}>
                                <thead>
                                    <tr className={s.tableHeadRow}>
                                        <th className={s.th}>Business</th>
                                        <th className={s.th}>Email</th>
                                        <th className={s.th}>Booking Link</th>
                                        <th className={s.th}>Status</th>
                                    </tr>
                                </thead>
                                <tbody className={s.tbody}>
                                    {(dashboard?.users || []).map((user) => {
                                        <tr key={user._id} className={s.tr}>
                                            <td className={s.td}>
                                                <div className={s.userBusinessName}>
                                                    {user.businessName || user.name}
                                                </div>
                                            </td>
                                            <td className={s.tdMuted}>{user.email}</td>
                                            <td className={s.tdMuted}>/book/{user.slug}</td>
                                            <td className={s.td}>
                                                <span className={`${s.payoutStatusBadge} ${getPayoutStatusClass(user.payoutDetails?.isComplete)}`}>
                                                    {user.payoutDetails?.isComplete
                                                        ? "Ready"
                                                        : "Pending Details"
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    })}
                                    {dashboard && dashboard.users?.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className={s.emptyTableCell}>
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={s.withdrawalCard}>
                        <h2 className={`${s.tableTitle} ${s.sectionTitleSpacing}`}>
                            <Clock className={s.tableTitleIcon} /> Withdrawal Requests
                        </h2>
                        <div className={s.withdrawalList}>
                            {(dashboard?.withdrawals || []).map((withdrawal) => {
                                const isWithdrawalLocked = isTerminalWithdrawalStatus(
                                    withdrawal.status
                                )
                                return (
                                    <div key={withdrawal._id} className={s.withdrawalItem}>
                                        <div className={s.withdrawalItemHeader}>
                                            <div>
                                                <p className={s.withdrawalProviderName}>
                                                    {withdrawal.userId?.businessName ||
                                                        withdrawal.userId.name}
                                                </p>
                                            </div>
                                            <p className={s.withdrawalProviderEmail}>
                                                {withdrawal.userId?.email}
                                            </p>
                                        </div>
                                        <div className={s.withdrawalAmountCol}>
                                            <span className={s.withdrawalAmount}>
                                                {formatMoney(withdrawal.amount)}
                                            </span>
                                            <div className={s.withdrawalStatusWrap}>
                                                <span className={`${s.withdrawalStatusBadge} ${getWithdrawalStatusClass(withdrawal.status)}`}>
                                                    {withdrawal.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={s.withdrawalAccountInfo}>
                                            <Landmark className={s.withdrawalAccountIcon} />
                                            {withdrawal.payoutSnapshot?.bankName || "UPI Connection"}
                                            {" "}•{" "}
                                            {withdrawal.payoutSnapshot?.accountLast4 ? `**** ${withdrawal.payoutSnapshot.accountLast4}` : withdrawal.payoutSnapshot?.upiId}
                                        </div>
                                        <div className={s.withdrawalActions}>
                                            {withdrawalStatuses.map((status) => {
                                                const isCurrentStatus = withdrawal.status === status
                                                const isUpdatingThisWithdrawal = updatingWithdrawalId === withdrawal._id
                                                return (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() =>
                                                            requestWithdrawalStatusChange(withdrawal, status)
                                                        }
                                                        disabled={
                                                            isUpdatingThisWithdrawal || isCurrentStatus || isWithdrawalLocked
                                                        }
                                                        className={`${s.withdrawalActionBtn} ${isCurrentStatus ? s.withdrawalActionBtnActive : s.withdrawalActionBtnInactive}`}
                                                    >
                                                        {isUpdatingThisWithdrawal && !isCurrentStatus
                                                            ? "..."
                                                            : formatStatusLabel(status)
                                                        }
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                            {dashboard && dashboard.withdrawals?.length === 0 && (
                                <div className={s.emptyWithdrawals}>
                                    <div className={s.emptyWithdrawalsIconCircle}>
                                        <CheckCircle className={s.emptyWithdrawalsIcon} />
                                    </div>
                                    <p className={s.emptyWithdrawalsText}>
                                        No pending withdrawal requests.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                {/* Recent bookings table */}
                <section className={s.recentBookingsCard}>
                    <h2 className={`${s.tableTitle} ${s.sectionTitleSpacing}`}>
                        <CheckCircle className={s.tableTitleIcon} /> Recent Paid Bookings
                    </h2>
                    <div className={s.tableScrollContainer}>
                        <table className={s.table}>
                            <thead>
                                <tr className={s.tableHeadRow}>
                                    <th className={s.th}>Provider</th>
                                    <th className={s.th}>Service</th>
                                    <th className={s.th}>Gross</th>
                                    <th className={s.th}>Fees</th>
                                    <th className={s.th}>Provider Share</th>
                                    <th className={s.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody className={s.tbody}>
                                {(dashboard?.recentBookings || []).map((booking) => (
                                    <tr key={booking._id} className={s.tr}>
                                        <td className={s.tdBold}>
                                            {booking.userId?.businessName || booking.userId?.name}
                                        </td>
                                        <td className={s.tdMuted}>
                                            {booking.serviceId?.name || "Service"}
                                        </td>
                                        <td className={s.tdBold}>{formatMoney(booking.amount)}</td>
                                        <td className={s.tdFees}>
                                            {formatMoney(booking.platformFeeAmount)}
                                        </td>
                                        <td className={s.tdEarnings}>
                                            {formatMoney(booking.providerPayoutAmount)}
                                        </td>
                                        <td className={s.td}>
                                            <span className={s.bookingPayoutBadge}>
                                                {booking.payoutStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {dashboard && dashboard.recentBookings?.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className={s.emptyTableCell}>
                                            No recent transactions.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {pendingWithdrawalAction && (
                <div className={s.confirmModalOverlay}>
                    <div
                        className={s.confirmModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="withdrawal-confirm-title"
                    >
                        <div className={s.confirmModalIconRow}>
                            <span className={s.confirmModalIconWrap}>
                                <WithdrawalConfirmIcon className={s.confirmModalIcon} />
                            </span>
                            <span
                                className={`${s.withdrawalStatusBadge} ${getWithdrawalStatusClass(pendingWithdrawalAction.status)}`}
                            >
                                {pendingWithdrawalAction.status}
                            </span>
                        </div>
                        <h3 id="withdrawal-confirm-title" className={s.confirmModalTitle}>
                            Confirm withdrawal status
                        </h3>
                        <p className={s.confirmModalText}>
                            Are you sure you want to mark this withdrawal as{" "}
                            {formatStatusLabel(pendingWithdrawalAction.status)}?
                        </p>
                        <div className={s.confirmModalMeta}>
                            <span>
                                {pendingWithdrawal?.userId?.businessName ||
                                    pendingWithdrawal?.userId?.name ||
                                    "Provider"}
                            </span>
                            <strong>{formatMoney(pendingWithdrawal?.amount)}</strong>
                        </div>
                        <div className={s.confirmModalActions}>
                            <button
                                type="button"
                                onClick={closeWithdrawalConfirm}
                                disabled={isConfirmingWithdrawal}
                                className={s.confirmModalCancelBtn}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={changeWithdrawalStatus}
                                disabled={isConfirmingWithdrawal}
                                className={s.confirmModalConfirmBtn}
                            >
                                {isConfirmingWithdrawal
                                    ? "Confirming..."
                                    : `Confirm ${formatStatusLabel(pendingWithdrawalAction.status)}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}