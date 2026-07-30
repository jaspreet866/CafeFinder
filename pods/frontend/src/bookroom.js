import { useState } from "react";
import { showError, showSuccess } from "./alerts";

export const BookRoom = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [room, setRooms] = useState("1");
    const [checkin, setCheckIn] = useState("");
    const [checkout, setCheckOut] = useState("");
    const [type, setRoomType] = useState("Standard Room");

    const bookRoom = async (e) => {
        e.preventDefault()
        const result = await fetch("https://cafefinder-u2me.onrender.com/api/hotel", {
            method: "post",
            body: JSON.stringify({ name, email, room, checkin, checkout, type }),
            headers: { "Content-type": "application/json;charset=UTF-8" }
        })
        if (result) {
            const res = await result.json()
            if (res.statuscode === 1) {
                showSuccess("Room Request Sent", "We will contact you with confirmation details.")
                setName("")
                setEmail("")
                setCheckIn("")
                setCheckOut("")
                setRoomType("")
                setRooms("")
            }
            else {
                showError("Booking Failed", "Please check your booking details and try again.")
            }
        }
    }

    return (
        <>
            <section className="book-room-page">
                <div className="container">
                    <div className="row align-items-center g-4 g-lg-5">
                        <div className="col-lg-5">
                            <div className="booking-copy animate-fade-up">
                                <p className="section-kicker">Stay with comfort</p>
                                <h1>Book Your Room</h1>
                                <p>
                                    Choose your room, add your dates, and send a quick booking request.
                                    The layout stays clean on mobile and gives the room page its own identity.
                                </p>
                                <div className="booking-highlights">
                                    <span>Flexible dates</span>
                                    <span>Fast confirmation</span>
                                    <span>Modern rooms</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="book-room-card animate-fade-up delay-1">
                                <form onSubmit={bookRoom}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Name</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                placeholder="Enter name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email</label>
                                            <input
                                                className="form-control"
                                                type="email"
                                                placeholder="Enter email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Room Type</label>
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
                                            <label className="form-label">Rooms</label>
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
                                            <label className="form-label">Check In</label>
                                            <input
                                                className="form-control"
                                                type="date"
                                                value={checkin}
                                                onChange={(e) => setCheckIn(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Check Out</label>
                                            <input
                                                className="form-control"
                                                type="date"
                                                value={checkout}
                                                onChange={(e) => setCheckOut(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <button className="btn btn-primary w-100 py-2" type="submit">
                                                Book Room
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
