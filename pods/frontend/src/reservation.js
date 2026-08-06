import { useContext, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { showError, showSuccess } from "./alerts"
import { Context } from "./usecontext"

export const Reserve = () => {
    const [searchParams] = useSearchParams()
    const placeId = searchParams.get("placeId") || searchParams.get("id") || ""
    const targetPlace = searchParams.get("name") || searchParams.get("place") || ""

    const { id: userId, mail: userMail } = useContext(Context)

    const [name, setname] = useState("")
    const [email, setemail] = useState(userMail || "")
    const [guest, setguest] = useState("1")
    const [date, setdate] = useState("")
    const [phone, setphone] = useState("")
    const [timeSlot, settimeSlot] = useState("12:00 PM - 02:00 PM")
    const [placename, setplacename] = useState(targetPlace)

    const reserve = async (e) => {
        e.preventDefault()

        const finalPlaceName = placename || targetPlace || "General Table"

        const result = await fetch("https://cafefinder-u2me.onrender.com/api/reservation", {
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
                placename: finalPlaceName
            }),
            headers: { "Content-type": "application/json;charset=UTF-8" }
        })

        if (result) {
            const res = await result.json()
            if (res.statuscode === 1) {
                showSuccess("Reservation Sent", `Your table request for ${finalPlaceName} has been submitted.`)
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
    }

    return (
        <>
            <section className="auth-page">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-9 col-lg-6">
                            <div className="form-panel shadow-sm p-4 rounded">
                                <p className="section-kicker">Reserve your spot</p>
                                <h1 className="mb-2">Book a Table</h1>
                                {targetPlace ? (
                                    <div className="alert alert-info py-2 mb-3">
                                        Booking for: <strong>{targetPlace}</strong>
                                    </div>
                                ) : (
                                    <div className="mb-3">
                                        <label className="form-label">Place / Cafe Name</label>
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter Cafe Name"
                                            value={placename}
                                            onChange={(e) => setplacename(e.target.value)}
                                        />
                                    </div>
                                )}
                                <form onSubmit={reserve}>
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter name"
                                            value={name}
                                            required
                                            onChange={(e) => setname(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            className="form-control"
                                            type="email"
                                            placeholder="Enter email"
                                            value={email}
                                            required
                                            onChange={(e) => setemail(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Phone</label>
                                        <input
                                            className="form-control"
                                            type="tel"
                                            placeholder="Enter Phone Number"
                                            value={phone}
                                            required
                                            onChange={(e) => setphone(e.target.value)}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Guests</label>
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
                                            <label className="form-label">Time Slot</label>
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
                                        <label className="form-label">Date</label>
                                        <input
                                            className="form-control"
                                            type="date"
                                            value={date}
                                            required
                                            onChange={(e) => setdate(e.target.value)}
                                        />
                                    </div>
                                    <button className="btn btn-primary w-100 py-2" type="submit">
                                        Reserve Table Now
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
