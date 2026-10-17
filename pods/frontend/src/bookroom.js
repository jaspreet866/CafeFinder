import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { showError, showSuccess } from "./alerts";
import { getApiUrl } from "./apiConfig";
import { Context } from "./usecontext";
import { FaBed, FaHotel, FaCalendarAlt } from "react-icons/fa";

export const BookRoom = () => {
    const [searchParams] = useSearchParams();
    const queryPlaceId = searchParams.get("placeId") || searchParams.get("id") || "";
    const queryPlaceName = searchParams.get("name") || searchParams.get("place") || "";

    const { id: userId, mail: userMail } = useContext(Context);

    const [name, setName] = useState("");
    const [email, setEmail] = useState(userMail || "");
    const [phone, setPhone] = useState("");
    const [room, setRooms] = useState("1");
    const [checkin, setCheckIn] = useState("");
    const [checkout, setCheckOut] = useState("");
    const [type, setRoomType] = useState("Standard Room");
    const [placeId, setPlaceId] = useState(queryPlaceId);
    const [placename, setPlaceName] = useState(queryPlaceName);
    const [allPlaces, setAllPlaces] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const res = await fetch(getApiUrl("/api/place"));
                const data = await res.json();
                if (data.statuscode === 1 && Array.isArray(data.data)) {
                    setAllPlaces(data.data);
                    if (!queryPlaceName && data.data.length > 0 && !placeId) {
                        setPlaceId(data.data[0]._id);
                        setPlaceName(data.data[0].Placename);
                    }
                }
            } catch (err) {
                console.error("Error fetching places:", err);
            }
        };
        fetchPlaces();
    }, [queryPlaceName, placeId]);

    const handleSelectPlace = (e) => {
        const selectedId = e.target.value;
        setPlaceId(selectedId);
        const match = allPlaces.find((p) => p._id === selectedId);
        if (match) {
            setPlaceName(match.Placename);
        }
    };

    const bookRoom = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const finalPlaceName = placename || queryPlaceName || "Grand Workspace Hotel";
            const result = await fetch(getApiUrl("/api/hotel"), {
                method: "post",
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    room,
                    checkin,
                    checkout,
                    type,
                    placeId,
                    placename: finalPlaceName,
                    userId: userId || ""
                }),
                headers: { "Content-type": "application/json;charset=UTF-8" }
            });
            if (result) {
                const res = await result.json();
                if (res.statuscode === 1) {
                    showSuccess(
                        "Room Request Sent",
                        `Your booking request for ${finalPlaceName} has been sent to the owner for confirmation.`
                    );
                    setName("");
                    if (!userMail) setEmail("");
                    setPhone("");
                    setCheckIn("");
                    setCheckOut("");
                    setRoomType("Standard Room");
                    setRooms("1");
                } else {
                    showError("Booking Failed", "Please check your booking details and try again.");
                }
            }
        } catch (err) {
            showError("Error", "Server error while submitting booking.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="book-room-page py-5">
            <div className="container">
                <div className="row align-items-center g-4 g-lg-5">
                    <div className="col-lg-5">
                        <div className="booking-copy animate-fade-up">
                            <p className="section-kicker">Stay with comfort</p>
                            <h1 className="display-6 fw-bold mb-3">Book Your Room</h1>
                            <p className="lead text-muted" style={{ fontSize: "1.05rem" }}>
                                Reserve premium rooms and boutique stays with high-speed fiber WiFi, workspace lounges, and fast owner response.
                            </p>
                            <div className="booking-highlights d-flex flex-wrap gap-2 mt-4">
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                                    <FaCalendarAlt className="me-1" /> Flexible dates
                                </span>
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                                    <FaBed className="me-1" /> Verified rooms
                                </span>
                                <span className="badge bg-info-subtle text-info border border-info-subtle px-3 py-2 rounded-pill">
                                    <FaHotel className="me-1" /> Direct owner approval
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-7">
                        <div className="book-room-card card border-0 shadow-lg p-4 rounded-4 bg-card animate-fade-up delay-1">
                            <form onSubmit={bookRoom}>
                                <div className="row g-3">
                                    {/* Place / Hotel Selection */}
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Destination / Space</label>
                                        {queryPlaceName ? (
                                            <div className="alert alert-primary py-2 px-3 mb-0 rounded-3 d-flex align-items-center justify-content-between">
                                                <span>Booking for: <strong>{queryPlaceName}</strong></span>
                                                <span className="badge bg-primary text-white">Selected Place</span>
                                            </div>
                                        ) : allPlaces.length > 0 ? (
                                            <select
                                                className="form-select"
                                                value={placeId}
                                                onChange={handleSelectPlace}
                                                required
                                            >
                                                <option value="" disabled>Select Hotel / Cafe Location</option>
                                                {allPlaces.map((p) => (
                                                    <option key={p._id} value={p._id}>
                                                        {p.Placename} {p.City ? `(${p.City})` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                className="form-control"
                                                placeholder="Enter place or hotel name"
                                                value={placename}
                                                onChange={(e) => setPlaceName(e.target.value)}
                                                required
                                            />
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Guest Name</label>
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter full name"
                                            value={name}
                                            required
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Email Address</label>
                                        <input
                                            className="form-control"
                                            type="email"
                                            placeholder="Enter email"
                                            value={email}
                                            required
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Phone Number</label>
                                        <input
                                            className="form-control"
                                            type="tel"
                                            placeholder="e.g. +91 9876543210"
                                            value={phone}
                                            required
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Room Type</label>
                                        <select
                                            className="form-select"
                                            value={type}
                                            onChange={(e) => setRoomType(e.target.value)}
                                        >
                                            <option>Standard Room</option>
                                            <option>Deluxe Room</option>
                                            <option>Family Suite</option>
                                            <option>Premium Suite</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Number of Rooms</label>
                                        <select
                                            className="form-select"
                                            value={room}
                                            onChange={(e) => setRooms(e.target.value)}
                                        >
                                            <option>1</option>
                                            <option>2</option>
                                            <option>3</option>
                                            <option>4</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Check In Date</label>
                                        <input
                                            className="form-control"
                                            type="date"
                                            value={checkin}
                                            required
                                            onChange={(e) => setCheckIn(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Check Out Date</label>
                                        <input
                                            className="form-control"
                                            type="date"
                                            value={checkout}
                                            required
                                            onChange={(e) => setCheckOut(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-12 mt-4">
                                        <button 
                                            className="btn btn-primary w-100 py-3 fw-bold shadow-sm" 
                                            type="submit"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Sending Request..." : "Submit Room Booking Request"}
                                        </button>
                                        <small className="text-muted text-center d-block mt-2">
                                            The place owner will review your request and confirm availability.
                                        </small>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
