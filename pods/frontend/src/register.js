import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { showError, showSuccess } from "./alerts"
import { getApiUrl } from "./apiConfig"
import { FaUser, FaStore } from "react-icons/fa"

export const Register = () => {
    const [name, setname] = useState("")
    const [pass, setpass] = useState("")
    const [email, setemail] = useState("")
    const [userType, setUserType] = useState("User") // User or Owner
    const navigate = useNavigate()

    const register = async (e) => {
        e.preventDefault()
        const data = { name, pass, email, userType }
        try {
            const result = await fetch(getApiUrl("/api/register"), {
                method: "post",
                body: JSON.stringify(data),
                headers: { "Content-type": "application/json;charset=UTF-8" }
            })
            if (result) {
                const res = await result.json()
                if (res.statuscode === 1) {
                    showSuccess(
                        "Account Created", 
                        userType === "Owner" 
                            ? "Partner account created! You can now log in and manage your cafes." 
                            : "You can now login to your WorkWave account."
                    )
                    setemail("")
                    setname("")
                    setpass("")
                    navigate("/login")
                }
                else {
                    showError("Registration Failed", "Please try again with valid details.")
                }
            }
        } catch (err) {
            showError("Network Error", "Unable to register at this time.")
        }
    }

    return (
        <>
            <section className="auth-page py-5">
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6">
                            <form className="form-panel shadow p-4 rounded-4 bg-card" onSubmit={register}>
                                <p className="section-kicker">Join WorkWave</p>
                                <h1 className="mb-4 h3 fw-bold">Create an Account</h1>

                                {/* ROLE SELECTOR: CUSTOMER VS CAFE OWNER */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">I am registering as:</label>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <button
                                                type="button"
                                                className={`btn w-100 p-3 rounded-3 d-flex flex-column align-items-center gap-1 border ${
                                                    userType === "User"
                                                        ? "btn-primary text-white"
                                                        : "btn-outline-secondary"
                                                }`}
                                                onClick={() => setUserType("User")}
                                            >
                                                <FaUser className="fs-5" />
                                                <span className="fw-semibold small">Customer</span>
                                                <small style={{ fontSize: "0.75rem", opacity: 0.85 }}>Find cafes & book</small>
                                            </button>
                                        </div>
                                        <div className="col-6">
                                            <button
                                                type="button"
                                                className={`btn w-100 p-3 rounded-3 d-flex flex-column align-items-center gap-1 border ${
                                                    userType === "Owner"
                                                        ? "btn-primary text-white"
                                                        : "btn-outline-secondary"
                                                }`}
                                                onClick={() => setUserType("Owner")}
                                            >
                                                <FaStore className="fs-5" />
                                                <span className="fw-semibold small">Cafe Owner</span>
                                                <small style={{ fontSize: "0.75rem", opacity: 0.85 }}>Manage spaces & menu</small>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        {userType === "Owner" ? "Owner / Business Name" : "Full Name"}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={userType === "Owner" ? "e.g. Blue Tokai Roasters" : "Your Name"}
                                        value={name}
                                        required
                                        onChange={(e) => setname(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="name@example.com"
                                        value={email}
                                        required
                                        onChange={(e) => setemail(e.target.value)}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Choose a strong password"
                                        value={pass}
                                        required
                                        onChange={(e) => setpass(e.target.value)}
                                    />
                                </div>

                                <button
                                    className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
                                    type="submit"
                                >
                                    {userType === "Owner" ? "Register Partner Account" : "Register Account"}
                                </button>
                            </form>
                        </div>

                        <div className="col-lg-6 d-lg-flex align-items-center">
                            <div className="side-panel w-100 p-4">
                                <h2 className="fw-bold">
                                    {userType === "Owner" ? "Grow Your Workspace" : "Explore & Work Seamlessly"}
                                </h2>

                                <p className="text-muted mt-3">
                                    {userType === "Owner"
                                        ? "Partner with WorkWave to list your cafe or coworking spaces, manage interactive menus, accept reservations, and engage with verified remote workers."
                                        : "Find the best workspaces with verified WiFi and charging points, save favorites, pre-order from digital menus, and book tables seamlessly."}
                                </p>

                                <ul className="list-unstyled mt-4">
                                    <li className="mb-2">
                                        {userType === "Owner" ? "✓ Real-time table booking management" : "✓ Easy reservations with menu pre-ordering"}
                                    </li>
                                    <li className="mb-2">
                                        {userType === "Owner" ? "✓ Live digital menu & stock toggling" : "✓ Interactive GPS map with distance radius"}
                                    </li>
                                    <li className="mb-2">
                                        {userType === "Owner" ? "✓ Official replies to customer reviews" : "✓ Upload review photos and rate workspaces"}
                                    </li>
                                </ul>
                                <hr />
                                <div>
                                    <p className="text-primary mb-2">Already have an account?</p>
                                    <button className="btn btn-outline-primary" onClick={() => navigate("/login")}>
                                        Sign In Here
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
