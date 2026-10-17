import { useContext, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { showError, showSuccess } from "./alerts"
import { Context } from "./usecontext"
import { getApiUrl } from "./apiConfig"
import { FaUtensils, FaCheckCircle } from "react-icons/fa"

export const Reserve = () => {
    const [searchParams] = useSearchParams()
    const placeId = searchParams.get("placeId") || searchParams.get("id") || ""
    const targetPlace = searchParams.get("name") || searchParams.get("place") || ""
    const preOrderTotal = Number(searchParams.get("preOrderTotal")) || 0
    
    let initialPreOrderItems = []
    try {
        const rawItems = searchParams.get("preOrderItems")
        if (rawItems) {
            initialPreOrderItems = JSON.parse(rawItems)
        }
    } catch (e) {
        initialPreOrderItems = []
    }

    const { id: userId, mail: userMail } = useContext(Context)

    const [name, setname] = useState("")
    const [email, setemail] = useState(userMail || "")
    const [guest, setguest] = useState("1")
    const [date, setdate] = useState("")
    const [phone, setphone] = useState("")
    const [timeSlot, settimeSlot] = useState("12:00 PM - 02:00 PM")
    const [placename, setplacename] = useState(targetPlace)
    const [submitting, setSubmitting] = useState(false)

    const reserve = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        const finalPlaceName = placename || targetPlace || "General Table"

        try {
            const result = await fetch(getApiUrl("/api/reservation"), {
                method: "post",
                body: JSON.stringify({
                    name,
                    email,
                    guest,
                    date,
                    phone,
                    timeSlot,
                    userId,
                    placeId,
                    placename: finalPlaceName,
                    preOrderItems: initialPreOrderItems,
                    preOrderTotal: preOrderTotal
                }),
                headers: { "Content-type": "application/json;charset=UTF-8" }
            })

            if (result) {
                const res = await result.json()
                if (res.statuscode === 1) {
                    showSuccess(
                        "Reservation Confirmed", 
                        `Your table at ${finalPlaceName} has been booked${preOrderTotal > 0 ? " with your pre-ordered items!" : "."}`
                    )
                    setname("")
                    setemail("")
                    setguest("1")
                    setdate("")
                    setphone("")
                }
                else {
                    showError("Reservation Failed", "Please check your details and try again.")
                }
            }
        } catch (err) {
            showError("Network Error", "Unable to complete reservation.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <section className="auth-page py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-9 col-lg-6">
                            <div className="form-panel shadow p-4 rounded-4 bg-card">
                                <p className="section-kicker">Reserve your spot</p>
                                <h1 className="mb-2 h3 fw-bold">Book a Table</h1>
                                {targetPlace ? (
                                    <div className="alert alert-info py-2 mb-3 rounded-3">
                                        Booking for: <strong>{targetPlace}</strong>
                                    </div>
                                ) : (
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Place / Cafe Name</label>
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter Cafe Name"
                                            value={placename}
                                            onChange={(e) => setplacename(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* PRE-ORDERED MENU ITEMS SUMMARY (Feature #4) */}
                                {initialPreOrderItems.length > 0 && (
                                    <div className="p-3 mb-3 bg-primary-subtle rounded-3 border border-primary-subtle">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="fw-bold small text-primary d-flex align-items-center gap-2">
                                                <FaUtensils /> Pre-ordered Menu Items
                                            </span>
                                            <span className="badge bg-primary text-white">
                                                Total: ₹{preOrderTotal}
                                            </span>
                                        </div>
                                        <ul className="list-unstyled mb-0 small">
                                            {initialPreOrderItems.map((item, idx) => (
                                                <li key={idx} className="d-flex justify-content-between py-1">
                                                    <span>{item.qty} &times; {item.name}</span>
                                                    <span className="fw-semibold">₹{item.price * item.qty}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <form onSubmit={reserve}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Full Name</label>
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Your Name"
                                            value={name}
                                            required
                                            onChange={(e) => setname(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Email</label>
                                        <input
                                            className="form-control"
                                            type="email"
                                            placeholder="Your Email"
                                            value={email}
                                            required
                                            onChange={(e) => setemail(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Phone Number</label>
                                        <input
                                            className="form-control"
                                            type="tel"
                                            placeholder="e.g. 9876543210"
                                            value={phone}
                                            required
                                            onChange={(e) => setphone(e.target.value)}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">Guests</label>
                                            <select
                                                className="form-select"
                                                value={guest}
                                                onChange={(e) => setguest(e.target.value)}
                                            >
                                                <option value="1">1 Person</option>
                                                <option value="2">2 Persons</option>
                                                <option value="3">3 Persons</option>
                                                <option value="4">4 Persons</option>
                                                <option value="5">5+ Persons</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">Time Slot</label>
                                            <select
                                                className="form-select"
                                                value={timeSlot}
                                                onChange={(e) => settimeSlot(e.target.value)}
                                            >
                                                <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                                                <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                                                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                                                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                                                <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                                                <option value="08:00 PM - 10:00 PM">08:00 PM - 10:00 PM</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">Date</label>
                                        <input
                                            className="form-control"
                                            type="date"
                                            value={date}
                                            required
                                            onChange={(e) => setdate(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm" 
                                        type="submit"
                                        disabled={submitting}
                                    >
                                        <FaCheckCircle /> {submitting ? "Booking..." : "Confirm Table Reservation"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
