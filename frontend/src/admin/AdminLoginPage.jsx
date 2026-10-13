import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { adminLogin } from "../api/admin";
import logo from "../assets/logo.png"
import { adminLoginPageStyles as s } from "../assets/dummyStyles"

export default function AdminLoginPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: "", password: "" })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setMessage("")

        try {
            const { data } = await adminLogin(form)
            if (data.token) {
                localStorage.setItem("adminToken", data.token)
            }
            navigate("/admin/dashboard")
        } catch (error) {
            setMessage(error.response?.data?.message || "Admin login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={s.pageContainer}>
            <div className={s.card}>
                {/* left decorative panel */}
                <div className={s.leftPanel}>
                    <div className={s.leftContent}>
                        <p className={s.leftEyebrow}>
                            System Access
                        </p>
                        <div className={s.leftLogoRow}>
                            <img src={logo} className={s.leftLogoImg} />
                        </div>
                        <h1 className={s.leftHeading}>
                            BookMe
                            <br />
                            <span className={s.leftHeadingAccent}>Admin</span>
                        </h1>
                        <p className={s.leftDescription}>
                            Money movement, user overview, and payout requests. Monitor the
                            platform from one desk.
                        </p>
                    </div>
                </div>

                {/* Right form panel */}
                <div className={s.rightPanel}>
                    <h2 className={s.formTitle}>
                        Admin Login
                    </h2>
                    <p className={s.formSubtitle}>
                        Enter your credential to access the dashboard
                    </p>
                    {message && <div className={s.messageBox}>{message}</div>}

                    <form onSubmit={handleSubmit} className={s.form}>
                        <div>
                            <label htmlFor="" className={s.inputLabel}>Email Address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(event) => {
                                    setForm((prev) => ({ ...prev, email: event.target.value }))
                                }}
                                className={s.textInput}
                                placeholder="Enter admin email..."
                                required
                            />
                            <div>
                                <label htmlFor="" className={s.inputLabel}>Password</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(event) => {
                                        setForm((prev) => ({ ...prev, password: event.target.value }))
                                    }}
                                    className={s.textInput}
                                    placeholder="Enter admin password..."
                                    required
                                />

                            </div>
                            <button type="submit" disabled={loading} className={s.submitButton}>
                                {loading ? "Authenticating..." : "Secure Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}