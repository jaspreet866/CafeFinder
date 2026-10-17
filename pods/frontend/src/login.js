import { useContext, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { showError, showSuccess } from "./alerts"
import { Context } from "./usecontext"
import { getApiUrl } from "./apiConfig"

export const Login = () => {
    const [email, setemail] = useState("")
    const [pass, setpass] = useState("")
    const [loading, setLoading] = useState(false)
    const { setid, setmail, setutype } = useContext(Context)
    const navigate = useNavigate()

    const login = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await fetch(getApiUrl("/api/login"), {
                method: "post",
                body: JSON.stringify({ email, pass }),
                headers: { "Content-type": "application/json;charset=UTF-8" }
            })
            if (result) {
                const res = await result.json()
                if (res.statuscode === 1) {
                    localStorage.setItem("data", JSON.stringify(res.jwtoken))
                    const userRole = res.data?.UserType || "User"
                    
                    if (setid) setid(res.data?._id || "")
                    if (setmail) setmail(res.data?.Email || "")
                    if (setutype) setutype(userRole)

                    showSuccess("Login Successful", `Welcome back to WorkWave, ${res.data?.Name || ""}!`)

                    if (userRole === "Owner") {
                        navigate("/owner")
                    } else {
                        navigate("/")
                    }
                }
                else {
                    showError("Login Failed", "Please check your email and password.")
                }
            }
        } catch (err) {
            showError("Network Error", "Unable to log in at this moment.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <section className="auth-page py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-5">
                            <form className="form-panel shadow p-4 rounded-4 bg-card" onSubmit={login}>
                                <p className="section-kicker">Welcome back</p>
                                <h1 className="mb-4 h3 fw-bold">Sign In</h1>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Email Address</label>
                                    <input
                                        className="form-control"
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        required
                                        onChange={(e) => setemail(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Password</label>
                                    <input
                                        className="form-control"
                                        type="password"
                                        placeholder="Enter password"
                                        value={pass}
                                        required
                                        onChange={(e) => setpass(e.target.value)}
                                    />
                                </div>
                                <button 
                                    className="btn btn-primary w-100 py-2 fw-semibold shadow-sm" 
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Authenticating..." : "Login"}
                                </button>
                                <div className="text-center mt-3 pt-3 border-top">
                                    <p className="text-muted small mb-0">
                                        Don't have an account? <Link to="/register" className="text-primary fw-semibold">Sign Up</Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
