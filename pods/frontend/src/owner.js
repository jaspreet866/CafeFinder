import { useContext, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Rating } from "react-simple-star-rating";
import { 
    FaStore, FaUtensils, FaCalendarCheck, FaComments, 
    FaPlus, FaCheck, FaTimes, FaMapMarkerAlt, FaTrash, 
    FaToggleOn, FaToggleOff, FaReply, FaBed, FaCalendarAlt 
} from "react-icons/fa";
import { Context } from "./usecontext";
import { showError, showSuccess, showInfo } from "./alerts";
import { getApiUrl } from "./apiConfig";

export const OwnerPortal = () => {
    const { id, mail } = useContext(Context);

    const [activeTab, setActiveTab] = useState("cafes"); // cafes | menu | bookings | reviews
    const [cafes, setCafes] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [hotelBookings, setHotelBookings] = useState([]);
    const [bookingSubTab, setBookingSubTab] = useState("tables"); // "tables" | "rooms"
    const [statusFilter, setStatusFilter] = useState("all"); // "all" | "Pending" | "Confirmed" | "Declined"
    const [reviews, setReviews] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCafeForMenu, setSelectedCafeForMenu] = useState("");
    const [loading, setLoading] = useState(false);

    // Form states for adding a new cafe
    const [showAddCafe, setShowAddCafe] = useState(false);
    const [cafeName, setCafeName] = useState("");
    const [cafeAbout, setCafeAbout] = useState("");
    const [cafeAddress, setCafeAddress] = useState("");
    const [cafeCity, setCafeCity] = useState("Delhi");
    const [cafeLat, setCafeLat] = useState("28.6139");
    const [cafeLng, setCafeLng] = useState("77.2090");
    const [cafeWifi, setCafeWifi] = useState(true);
    const [cafeGaming, setCafeGaming] = useState(false);
    const [cafeMeeting, setCafeMeeting] = useState(true);
    const [cafeFiles, setCafeFiles] = useState([]);

    // Form states for adding a menu item
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [menuName, setMenuName] = useState("");
    const [menuCategory, setMenuCategory] = useState("Coffee & Espresso");
    const [menuPrice, setMenuPrice] = useState("");
    const [menuDesc, setMenuDesc] = useState("");
    const [menuIsVeg, setMenuIsVeg] = useState(true);
    const [menuImage, setMenuImage] = useState(null);

    // Reply state
    const [replyInputs, setReplyInputs] = useState({});

    // Fetch Owner's Cafes
    const fetchOwnerCafes = useCallback(async () => {
        if (!id) return;
        try {
            const res = await fetch(getApiUrl(`/api/owner/places/${id}?email=${encodeURIComponent(mail || "")}`));
            const data = await res.json();
            if (data.statuscode === 1) {
                setCafes(data.data || []);
                if (data.data && data.data.length > 0 && !selectedCafeForMenu) {
                    setSelectedCafeForMenu(data.data[0]._id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch owner cafes:", err);
        }
    }, [id, mail, selectedCafeForMenu]);

    // Fetch Owner's Reservations
    const fetchOwnerReservations = useCallback(async () => {
        if (!id) return;
        try {
            const res = await fetch(getApiUrl(`/api/owner/reservations/${id}?email=${encodeURIComponent(mail || "")}`));
            const data = await res.json();
            if (data.statuscode === 1) {
                setReservations(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch owner reservations:", err);
        }
    }, [id, mail]);

    // Fetch Owner's Hotel Room Bookings
    const fetchOwnerHotelBookings = useCallback(async () => {
        if (!id) return;
        try {
            const res = await fetch(getApiUrl(`/api/owner/hotel-bookings/${id}?email=${encodeURIComponent(mail || "")}`));
            const data = await res.json();
            if (data.statuscode === 1) {
                setHotelBookings(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch owner hotel bookings:", err);
        }
    }, [id, mail]);

    // Fetch Owner's Reviews
    const fetchOwnerReviews = useCallback(async () => {
        if (!id) return;
        try {
            const res = await fetch(getApiUrl(`/api/owner/reviews/${id}?email=${encodeURIComponent(mail || "")}`));
            const data = await res.json();
            if (data.statuscode === 1) {
                setReviews(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch owner reviews:", err);
        }
    }, [id, mail]);

    // Fetch Menu items for selected cafe
    const fetchCafeMenu = useCallback(async (cafeId) => {
        if (!cafeId) return;
        try {
            const res = await fetch(getApiUrl(`/api/menu/${cafeId}`));
            const data = await res.json();
            if (data.statuscode === 1) {
                setMenuItems(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch menu items:", err);
        }
    }, []);

    useEffect(() => {
        if (id) {
            fetchOwnerCafes();
            fetchOwnerReservations();
            fetchOwnerHotelBookings();
            fetchOwnerReviews();
        }
    }, [id, fetchOwnerCafes, fetchOwnerReservations, fetchOwnerHotelBookings, fetchOwnerReviews]);

    useEffect(() => {
        if (selectedCafeForMenu) {
            fetchCafeMenu(selectedCafeForMenu);
        }
    }, [selectedCafeForMenu, fetchCafeMenu]);

    // Handle Create New Cafe
    const handleAddCafeSubmit = async (e) => {
        e.preventDefault();
        if (cafeFiles.length === 0) {
            showInfo("Photos Required", "Please upload at least one photo of your workspace.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", cafeName);
            formData.append("about", cafeAbout);
            formData.append("address", cafeAddress);
            formData.append("city", cafeCity);
            formData.append("lat", cafeLat);
            formData.append("lng", cafeLng);
            formData.append("wifi", cafeWifi);
            formData.append("gaming", cafeGaming);
            formData.append("meeting", cafeMeeting);
            formData.append("rating", "4.8");
            formData.append("type", "6a0494a3da7b49bca4d98cf0"); // default cafe type
            formData.append("ownerId", id);
            formData.append("ownerEmail", mail);

            for (let i = 0; i < cafeFiles.length; i++) {
                formData.append("images", cafeFiles[i]);
            }

            const res = await fetch(getApiUrl("/api/place"), {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.statuscode === 1) {
                showSuccess("Cafe Listed Successfully", "Your workspace is now live on the map and discoverable by remote workers!");
                setShowAddCafe(false);
                setCafeName("");
                setCafeAbout("");
                setCafeAddress("");
                setCafeFiles([]);
                fetchOwnerCafes();
            } else {
                showError("Listing Failed", "Unable to list cafe. Please try again.");
            }
        } catch (err) {
            showError("Network Error", "Failed to upload cafe listing.");
        } finally {
            setLoading(false);
        }
    };

    // Handle Add Menu Item
    const handleAddMenuItemSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCafeForMenu) {
            showInfo("Select Workspace", "Please select a cafe to attach this menu item to.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("placeId", selectedCafeForMenu);
            formData.append("name", menuName);
            formData.append("category", menuCategory);
            formData.append("price", menuPrice);
            formData.append("description", menuDesc);
            formData.append("isVeg", menuIsVeg);
            if (menuImage) {
                formData.append("pic", menuImage);
            }

            const res = await fetch(getApiUrl("/api/menu"), {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.statuscode === 1) {
                showSuccess("Menu Item Added", `${menuName} is now live on your cafe's digital menu.`);
                setShowAddMenu(false);
                setMenuName("");
                setMenuPrice("");
                setMenuDesc("");
                setMenuImage(null);
                fetchCafeMenu(selectedCafeForMenu);
            } else {
                showError("Failed", "Could not add menu item.");
            }
        } catch (err) {
            showError("Network Error", "Failed to add menu item.");
        } finally {
            setLoading(false);
        }
    };

    // Toggle Menu Item In-Stock
    const handleToggleStock = async (menuItemId) => {
        try {
            const res = await fetch(getApiUrl(`/api/menu/${menuItemId}/toggle`), {
                method: "PUT",
            });
            const data = await res.json();
            if (data.statuscode === 1) {
                setMenuItems((prev) =>
                    prev.map((item) =>
                        item._id === menuItemId ? { ...item, InStock: data.inStock } : item
                    )
                );
            }
        } catch (err) {
            console.error("Toggle stock error:", err);
        }
    };

    // Delete Menu Item
    const handleDeleteMenuItem = async (menuItemId) => {
        if (!window.confirm("Are you sure you want to remove this item from your menu?")) return;
        try {
            const res = await fetch(getApiUrl(`/api/menu/${menuItemId}`), {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.statuscode === 1) {
                setMenuItems((prev) => prev.filter((i) => i._id !== menuItemId));
                showSuccess("Removed", "Item deleted from menu.");
            }
        } catch (err) {
            showError("Error", "Could not remove item.");
        }
    };

    // Update Reservation Status (Confirm / Decline)
    const handleUpdateBookingStatus = async (bookingId, newStatus) => {
        try {
            const res = await fetch(getApiUrl("/api/updatereservationstatus"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: bookingId, status: newStatus }),
            });
            const data = await res.json();
            if (data.statuscode === 1) {
                showSuccess("Booking Updated", `Table reservation marked as ${newStatus}.`);
                setReservations((prev) =>
                    prev.map((r) => (r._id === bookingId ? { ...r, Status: newStatus } : r))
                );
            }
        } catch (err) {
            showError("Error", "Failed to update reservation status.");
        }
    };

    // Cancel Table Reservation
    const handleCancelTableBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to delete this table reservation?")) return;
        try {
            const res = await fetch(getApiUrl(`/api/cancelreservation/${bookingId}`), {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.statuscode === 1) {
                setReservations((prev) => prev.filter((r) => r._id !== bookingId));
                showSuccess("Removed", "Table reservation deleted.");
            }
        } catch (err) {
            showError("Error", "Could not delete table reservation.");
        }
    };

    // Update Room Booking Status (Confirm / Decline)
    const handleUpdateHotelStatus = async (bookingId, newStatus) => {
        try {
            const res = await fetch(getApiUrl("/api/updatehotelstatus"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: bookingId, status: newStatus }),
            });
            const data = await res.json();
            if (data.statuscode === 1) {
                showSuccess("Room Booking Updated", `Room request marked as ${newStatus}.`);
                setHotelBookings((prev) =>
                    prev.map((b) => (b._id === bookingId ? { ...b, Status: newStatus } : b))
                );
            }
        } catch (err) {
            showError("Error", "Failed to update room booking status.");
        }
    };

    // Cancel Hotel Booking
    const handleCancelHotelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to remove this room booking?")) return;
        try {
            const res = await fetch(getApiUrl(`/api/cancelhotel/${bookingId}`), {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.statuscode === 1) {
                setHotelBookings((prev) => prev.filter((b) => b._id !== bookingId));
                showSuccess("Removed", "Room booking request deleted.");
            }
        } catch (err) {
            showError("Error", "Could not delete room booking.");
        }
    };

    // Send Owner Reply to Review
    const handleSendReviewReply = async (reviewId) => {
        const text = replyInputs[reviewId];
        if (!text || text.trim() === "") return;

        try {
            const res = await fetch(getApiUrl(`/api/review/${reviewId}/reply`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reply: text }),
            });
            const data = await res.json();
            if (data.statuscode === 1) {
                showSuccess("Reply Posted", "Customer will see your official owner response.");
                setReplyInputs((prev) => ({ ...prev, [reviewId]: "" }));
                fetchOwnerReviews();
            }
        } catch (err) {
            showError("Error", "Could not submit reply.");
        }
    };

    // If user is not logged in
    if (!id) {
        return (
            <div className="container py-5 text-center">
                <div className="p-5 shadow rounded-4 bg-card mx-auto" style={{ maxWidth: "600px" }}>
                    <FaStore className="display-4 text-primary mb-3" />
                    <h2 className="fw-bold">Cafe Owner & Partner Portal</h2>
                    <p className="text-muted">
                        Please log in with your Partner account to manage your cafe listings, digital menus, table bookings, and customer feedback.
                    </p>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Link to="/login" className="btn btn-primary px-4 py-2">
                            Login as Partner
                        </Link>
                        <Link to="/register" className="btn btn-outline-secondary px-4 py-2">
                            Register New Cafe
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="owner-portal py-5">
            <div className="container">
                {/* Header Profile / Welcome Banner */}
                <div className="d-flex flex-wrap align-items-center justify-content-between p-4 mb-4 rounded-4 shadow-sm bg-card border">
                    <div>
                        <span className="badge bg-primary text-white mb-2">Partner / Cafe Owner</span>
                        <h2 className="fw-bold mb-1">Partner Management Console</h2>
                        <p className="text-muted mb-0">Logged in as {mail || "Partner"}</p>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <button
                            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                            onClick={() => {
                                setActiveTab("cafes");
                                setShowAddCafe(true);
                            }}
                        >
                            <FaPlus /> List New Workspace
                        </button>
                    </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="row g-3 mb-4">
                    <div className="col-6 col-lg-3">
                        <div className="p-3 rounded-4 shadow-sm bg-card border text-center">
                            <span className="text-muted small d-block">My Workspaces</span>
                            <h3 className="fw-bold text-primary mb-0">{cafes.length}</h3>
                        </div>
                    </div>
                    <div className="col-6 col-lg-3">
                        <div className="p-3 rounded-4 shadow-sm bg-card border text-center">
                            <span className="text-muted small d-block">Live Bookings</span>
                            <h3 className="fw-bold text-success mb-0">{reservations.length}</h3>
                        </div>
                    </div>
                    <div className="col-6 col-lg-3">
                        <div className="p-3 rounded-4 shadow-sm bg-card border text-center">
                            <span className="text-muted small d-block">Active Menu Items</span>
                            <h3 className="fw-bold text-warning-emphasis mb-0">{menuItems.length}</h3>
                        </div>
                    </div>
                    <div className="col-6 col-lg-3">
                        <div className="p-3 rounded-4 shadow-sm bg-card border text-center">
                            <span className="text-muted small d-block">Customer Reviews</span>
                            <h3 className="fw-bold text-info-emphasis mb-0">{reviews.length}</h3>
                        </div>
                    </div>
                </div>

                {/* Pending Request Calculations */}
                {(() => null)()}
                {/* Navigation Tabs */}
                <ul className="nav nav-pills detail-tabs gap-2 mb-4 border-bottom pb-3">
                    <li className="nav-item">
                        <button
                            className={`nav-link px-4 py-2 fw-semibold ${activeTab === "cafes" ? "active" : ""}`}
                            onClick={() => setActiveTab("cafes")}
                        >
                            <FaStore className="me-2" /> My Cafes ({cafes.length})
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link px-4 py-2 fw-semibold ${activeTab === "menu" ? "active" : ""}`}
                            onClick={() => setActiveTab("menu")}
                        >
                            <FaUtensils className="me-2" /> Digital Menu Manager
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link px-4 py-2 fw-semibold position-relative ${activeTab === "bookings" ? "active" : ""}`}
                            onClick={() => setActiveTab("bookings")}
                        >
                            <FaCalendarCheck className="me-2" /> Bookings & Requests
                            {(reservations.filter(r => r.Status === "Pending").length + hotelBookings.filter(b => b.Status === "Pending").length) > 0 ? (
                                <span className="badge rounded-pill bg-danger ms-2 px-2 py-1">
                                    {reservations.filter(r => r.Status === "Pending").length + hotelBookings.filter(b => b.Status === "Pending").length} pending
                                </span>
                            ) : (
                                <span className="badge rounded-pill bg-secondary ms-2 px-2 py-1">
                                    {reservations.length + hotelBookings.length}
                                </span>
                            )}
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link px-4 py-2 fw-semibold ${activeTab === "reviews" ? "active" : ""}`}
                            onClick={() => setActiveTab("reviews")}
                        >
                            <FaComments className="me-2" /> Customer Reviews ({reviews.length})
                        </button>
                    </li>
                </ul>

                {/* TAB 1: MY CAFES */}
                {activeTab === "cafes" && (
                    <div>
                        {/* ADD CAFE MODAL / COLLAPSE */}
                        {showAddCafe && (
                            <div className="card border-0 shadow-lg p-4 rounded-4 mb-4 bg-card">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="fw-bold mb-0">List a New Cafe or Coworking Space</h4>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowAddCafe(false)}>
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleAddCafeSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Workspace Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Blue Tokai Roastery"
                                                value={cafeName}
                                                onChange={(e) => setCafeName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">City</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Delhi, Mumbai, Bengaluru..."
                                                value={cafeCity}
                                                onChange={(e) => setCafeCity(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">About / Ambiance Description</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                placeholder="Describe the noise level, seating options, vibe, coffee specialty..."
                                                value={cafeAbout}
                                                onChange={(e) => setCafeAbout(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Full Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Street, locality, landmarks"
                                                value={cafeAddress}
                                                onChange={(e) => setCafeAddress(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Map Latitude (GPS)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. 28.6139"
                                                value={cafeLat}
                                                onChange={(e) => setCafeLat(e.target.value)}
                                                required
                                            />
                                            <small className="text-muted">Used for the interactive map and distance search.</small>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Map Longitude (GPS)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. 77.2090"
                                                value={cafeLng}
                                                onChange={(e) => setCafeLng(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold d-block">Amenities Available</label>
                                            <div className="d-flex gap-4">
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id="wifiCheck"
                                                        checked={cafeWifi}
                                                        onChange={(e) => setCafeWifi(e.target.checked)}
                                                    />
                                                    <label className="form-check-label" htmlFor="wifiCheck">Fast WiFi</label>
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id="meetingCheck"
                                                        checked={cafeMeeting}
                                                        onChange={(e) => setCafeMeeting(e.target.checked)}
                                                    />
                                                    <label className="form-check-label" htmlFor="meetingCheck">Meeting Friendly</label>
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id="gamingCheck"
                                                        checked={cafeGaming}
                                                        onChange={(e) => setCafeGaming(e.target.checked)}
                                                    />
                                                    <label className="form-check-label" htmlFor="gamingCheck">Gaming / Lounge</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Workspace Photos (1 - 4 images)</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => setCafeFiles(Array.from(e.target.files))}
                                                required
                                            />
                                        </div>
                                        <div className="col-12 mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-primary px-4 py-2"
                                                disabled={loading}
                                            >
                                                {loading ? "Publishing Listing..." : "Publish Workspace Listing"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* CAFES LIST */}
                        <div className="row g-4">
                            {cafes.length === 0 ? (
                                <div className="col-12 text-center py-5 border rounded-4 text-muted bg-card">
                                    <FaStore className="display-4 text-muted mb-2" />
                                    <h5>No Workspaces Listed Yet</h5>
                                    <p>Start listing your cafe or coworking space to accept table bookings and orders.</p>
                                    <button className="btn btn-primary" onClick={() => setShowAddCafe(true)}>
                                        List Your First Cafe
                                    </button>
                                </div>
                            ) : (
                                cafes.map((cafe) => (
                                    <div className="col-md-6 col-lg-4" key={cafe._id}>
                                        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                                            <img
                                                src={cafe.Image?.[0] || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"}
                                                alt={cafe.Placename}
                                                className="card-img-top object-fit-cover"
                                                style={{ height: "180px" }}
                                            />
                                            <div className="card-body p-3">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h5 className="fw-bold mb-0 text-truncate">{cafe.Placename}</h5>
                                                    <span className="badge bg-warning-subtle text-warning-emphasis">
                                                        ⭐ {cafe.Rating || "4.8"}
                                                    </span>
                                                </div>
                                                <p className="text-muted small mb-2 text-truncate">
                                                    <FaMapMarkerAlt className="text-danger me-1" />
                                                    {cafe.Address || cafe.City}
                                                </p>
                                                <div className="d-flex gap-2 my-2">
                                                    {cafe.WiFi && <span className="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">⚡ WiFi</span>}
                                                    {cafe.Meeting && <span className="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">👥 Meetings</span>}
                                                </div>
                                                <div className="d-flex gap-2 mt-3 pt-2 border-top">
                                                    <Link to={`/place/${cafe._id}`} className="btn btn-sm btn-outline-primary flex-grow-1">
                                                        View Public Page
                                                    </Link>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => {
                                                            setSelectedCafeForMenu(cafe._id);
                                                            setActiveTab("menu");
                                                        }}
                                                    >
                                                        Manage Menu
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: DIGITAL MENU MANAGER */}
                {activeTab === "menu" && (
                    <div>
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <label className="fw-bold mb-0">Select Workspace:</label>
                                <select
                                    className="form-select w-auto"
                                    value={selectedCafeForMenu}
                                    onChange={(e) => setSelectedCafeForMenu(e.target.value)}
                                >
                                    {cafes.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.Placename}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                                onClick={() => setShowAddMenu(!showAddMenu)}
                            >
                                <FaPlus /> Add New Menu Item
                            </button>
                        </div>

                        {/* ADD MENU ITEM FORM */}
                        {showAddMenu && (
                            <div className="card border-0 shadow p-4 rounded-4 mb-4 bg-card">
                                <h5 className="fw-bold mb-3">Add Menu Item</h5>
                                <form onSubmit={handleAddMenuItemSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Item Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Vanilla Oat Cold Brew"
                                                value={menuName}
                                                onChange={(e) => setMenuName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Category</label>
                                            <select
                                                className="form-select"
                                                value={menuCategory}
                                                onChange={(e) => setMenuCategory(e.target.value)}
                                            >
                                                <option value="Coffee & Espresso">Coffee & Espresso</option>
                                                <option value="Cold Drinks">Cold Drinks</option>
                                                <option value="Tea & Chai">Tea & Chai</option>
                                                <option value="Food & Bites">Food & Bites</option>
                                                <option value="Bakery & Sweets">Bakery & Sweets</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Price (₹)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="e.g. 220"
                                                value={menuPrice}
                                                onChange={(e) => setMenuPrice(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Description</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Key ingredients, roast notes, allergens..."
                                                value={menuDesc}
                                                onChange={(e) => setMenuDesc(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-check mt-2">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="vegCheck"
                                                    checked={menuIsVeg}
                                                    onChange={(e) => setMenuIsVeg(e.target.checked)}
                                                />
                                                <label className="form-check-label" htmlFor="vegCheck">
                                                    Vegetarian Item
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Photo (Optional)</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={(e) => setMenuImage(e.target.files[0])}
                                            />
                                        </div>
                                        <div className="col-12 mt-3">
                                            <button type="submit" className="btn btn-primary px-4 py-2" disabled={loading}>
                                                {loading ? "Adding..." : "Save to Digital Menu"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* MENU ITEMS TABLE / LIST */}
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-card">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Item</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Diet</th>
                                            <th>Availability</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menuItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-muted">
                                                    No custom menu items added for this cafe yet. Click "Add New Menu Item" above.
                                                </td>
                                            </tr>
                                        ) : (
                                            menuItems.map((item) => (
                                                <tr key={item._id}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            {item.Image && (
                                                                <img
                                                                    src={item.Image}
                                                                    alt={item.Name}
                                                                    className="rounded-2 object-fit-cover"
                                                                    style={{ width: "40px", height: "40px" }}
                                                                />
                                                            )}
                                                            <div>
                                                                <span className="fw-semibold d-block">{item.Name}</span>
                                                                <small className="text-muted">{item.Description}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary-subtle text-secondary">
                                                            {item.Category}
                                                        </span>
                                                    </td>
                                                    <td className="fw-bold">₹{item.Price}</td>
                                                    <td>
                                                        <span className={`badge ${item.IsVeg ? "bg-success" : "bg-danger"}`}>
                                                            {item.IsVeg ? "Veg" : "Non-Veg"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className={`btn btn-sm d-flex align-items-center gap-1 ${
                                                                item.InStock ? "btn-outline-success" : "btn-outline-secondary"
                                                            }`}
                                                            onClick={() => handleToggleStock(item._id)}
                                                        >
                                                            {item.InStock ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                                                            {item.InStock ? "In Stock" : "Sold Out"}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteMenuItem(item._id)}
                                                            title="Delete Item"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: BOOKINGS & RESERVATIONS (TABLES & ROOMS) */}
                {activeTab === "bookings" && (() => {
                    const pendingTables = reservations.filter((r) => (r.Status || "Pending") === "Pending").length;
                    const pendingRooms = hotelBookings.filter((b) => (b.Status || "Pending") === "Pending").length;

                    const filteredReservations = reservations.filter((r) => {
                        if (statusFilter === "all") return true;
                        return (r.Status || "Pending") === statusFilter;
                    });

                    const filteredHotelBookings = hotelBookings.filter((b) => {
                        if (statusFilter === "all") return true;
                        return (b.Status || "Pending") === statusFilter;
                    });

                    return (
                        <div>
                            {/* Sub Tabs: Tables vs Rooms */}
                            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
                                <div className="btn-group shadow-sm p-1 bg-card rounded-pill border">
                                    <button
                                        type="button"
                                        className={`btn rounded-pill px-4 fw-semibold ${
                                            bookingSubTab === "tables" ? "btn-primary shadow-sm" : "btn-light text-body"
                                        }`}
                                        onClick={() => setBookingSubTab("tables")}
                                    >
                                        <FaUtensils className="me-2" />
                                        Table Reservations ({reservations.length})
                                        {pendingTables > 0 && (
                                            <span className="badge bg-danger rounded-pill ms-2">
                                                {pendingTables} Pending
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn rounded-pill px-4 fw-semibold ${
                                            bookingSubTab === "rooms" ? "btn-primary shadow-sm" : "btn-light text-body"
                                        }`}
                                        onClick={() => setBookingSubTab("rooms")}
                                    >
                                        <FaBed className="me-2" />
                                        Room Bookings ({hotelBookings.length})
                                        {pendingRooms > 0 && (
                                            <span className="badge bg-danger rounded-pill ms-2">
                                                {pendingRooms} Pending
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Status Filter Pills */}
                                <div className="d-flex align-items-center gap-1 bg-card border rounded-pill p-1 shadow-sm">
                                    {["all", "Pending", "Confirmed", "Declined"].map((st) => (
                                        <button
                                            key={st}
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                                                statusFilter === st ? "btn-primary" : "btn-light text-secondary border-0"
                                            }`}
                                            onClick={() => setStatusFilter(st)}
                                        >
                                            {st === "all" ? "All" : st}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* SUB-PANEL 1: TABLE RESERVATIONS */}
                            {bookingSubTab === "tables" && (
                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-card">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Guest Details</th>
                                                    <th>Workspace / Cafe</th>
                                                    <th>Date & Time Slot</th>
                                                    <th>Party Size</th>
                                                    <th>Pre-Ordered Items</th>
                                                    <th>Current Status</th>
                                                    <th className="text-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredReservations.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-5 text-muted">
                                                            No table reservations found matching this filter.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredReservations.map((r) => (
                                                        <tr key={r._id}>
                                                            <td>
                                                                <div className="fw-semibold">{r.Name}</div>
                                                                <small className="text-muted d-block">{r.Email}</small>
                                                                {r.Phone && <small className="text-muted">{r.Phone}</small>}
                                                            </td>
                                                            <td className="fw-semibold">{r.Placename}</td>
                                                            <td>
                                                                <div className="fw-semibold">{r.Date}</div>
                                                                <small className="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">
                                                                    {r.TimeSlot}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-light text-dark border">
                                                                    {r.Guests} pax
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {r.PreOrderItems && r.PreOrderItems.length > 0 ? (
                                                                    <div>
                                                                        <span className="badge bg-primary mb-1">
                                                                            ₹{r.PreOrderTotal} Total
                                                                        </span>
                                                                        <ul className="list-unstyled mb-0 small text-muted">
                                                                            {r.PreOrderItems.map((pi, idx) => (
                                                                                <li key={idx}>
                                                                                    {pi.qty}&times; {pi.name}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted small">None</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span
                                                                    className={`badge ${
                                                                        r.Status === "Confirmed"
                                                                            ? "bg-success"
                                                                            : r.Status === "Declined"
                                                                            ? "bg-danger"
                                                                            : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                                                                    }`}
                                                                >
                                                                    {r.Status || "Pending"}
                                                                </span>
                                                            </td>
                                                            <td className="text-end">
                                                                <div className="btn-group btn-group-sm">
                                                                    <button
                                                                        className="btn btn-outline-success"
                                                                        onClick={() => handleUpdateBookingStatus(r._id, "Confirmed")}
                                                                        title="Confirm Table Reservation"
                                                                    >
                                                                        <FaCheck className="me-1" /> Accept
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-outline-danger"
                                                                        onClick={() => handleUpdateBookingStatus(r._id, "Declined")}
                                                                        title="Decline Table Reservation"
                                                                    >
                                                                        <FaTimes className="me-1" /> Decline
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-outline-secondary"
                                                                        onClick={() => handleCancelTableBooking(r._id)}
                                                                        title="Delete Reservation"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* SUB-PANEL 2: ROOM BOOKINGS */}
                            {bookingSubTab === "rooms" && (
                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-card">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Guest Details</th>
                                                    <th>Workspace / Hotel</th>
                                                    <th>Dates (Check In - Out)</th>
                                                    <th>Room Type & Count</th>
                                                    <th>Status</th>
                                                    <th className="text-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredHotelBookings.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-5 text-muted">
                                                            No room bookings found matching this filter.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredHotelBookings.map((b) => (
                                                        <tr key={b._id}>
                                                            <td>
                                                                <div className="fw-semibold">{b.Name}</div>
                                                                <small className="text-muted d-block">{b.Email}</small>
                                                                {b.Phone && <small className="text-muted">{b.Phone}</small>}
                                                            </td>
                                                            <td>
                                                                <div className="fw-semibold">{b.Placename || "Workspace Hotel"}</div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-1">
                                                                    <FaCalendarAlt className="text-muted small" />
                                                                    <span>{b.CheckIn} &rarr; {b.CheckOut}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle me-1">
                                                                    {b.RoomType || "Standard"}
                                                                </span>
                                                                <small className="text-muted">({b.Rooms || 1} room{Number(b.Rooms) > 1 ? "s" : ""})</small>
                                                            </td>
                                                            <td>
                                                                <span
                                                                    className={`badge ${
                                                                        b.Status === "Confirmed"
                                                                            ? "bg-success"
                                                                            : b.Status === "Declined"
                                                                            ? "bg-danger"
                                                                            : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                                                                    }`}
                                                                >
                                                                    {b.Status || "Pending"}
                                                                </span>
                                                            </td>
                                                            <td className="text-end">
                                                                <div className="btn-group btn-group-sm">
                                                                    <button
                                                                        className="btn btn-outline-success"
                                                                        onClick={() => handleUpdateHotelStatus(b._id, "Confirmed")}
                                                                        title="Confirm Room Booking"
                                                                    >
                                                                        <FaCheck className="me-1" /> Accept
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-outline-danger"
                                                                        onClick={() => handleUpdateHotelStatus(b._id, "Declined")}
                                                                        title="Decline Room Booking"
                                                                    >
                                                                        <FaTimes className="me-1" /> Decline
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-outline-secondary"
                                                                        onClick={() => handleCancelHotelBooking(b._id)}
                                                                        title="Delete Booking"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* TAB 4: CUSTOMER REVIEWS & OWNER REPLIES */}
                {activeTab === "reviews" && (
                    <div className="row g-4">
                        {reviews.length === 0 ? (
                            <div className="col-12 text-center py-5 border rounded-4 text-muted bg-card">
                                <h5>No Customer Reviews Yet</h5>
                                <p>Reviews left by customers on your cafe listings will appear here.</p>
                            </div>
                        ) : (
                            reviews.map((rev) => (
                                <div className="col-lg-6" key={rev._id}>
                                    <div className="card h-100 border-0 shadow-sm p-4 rounded-4 bg-card">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h6 className="fw-bold mb-0">{rev.Name}</h6>
                                                <Rating initialValue={parseFloat(rev.Rating) || 5} allowFraction readonly size={16} />
                                            </div>
                                            <small className="text-muted">{rev.Date?.split("T")[0]}</small>
                                        </div>

                                        <p className="text-secondary small my-2">"{rev.Msg}"</p>

                                        {/* User uploaded review photos */}
                                        {rev.Images && rev.Images.length > 0 && (
                                            <div className="d-flex gap-2 my-2">
                                                {rev.Images.map((imgUrl, i) => (
                                                    <img
                                                        key={i}
                                                        src={imgUrl}
                                                        alt="attachment"
                                                        className="rounded-2 object-fit-cover"
                                                        style={{ width: "50px", height: "50px" }}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Existing Owner Reply */}
                                        {rev.OwnerReply ? (
                                            <div className="p-2 rounded-3 bg-light border-start border-primary border-3 mt-3">
                                                <small className="fw-bold text-primary d-block">Your Response:</small>
                                                <small className="text-secondary fst-italic">"{rev.OwnerReply.text}"</small>
                                            </div>
                                        ) : (
                                            <div className="mt-3 pt-2 border-top">
                                                <div className="input-group input-group-sm">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Write an official reply..."
                                                        value={replyInputs[rev._id] || ""}
                                                        onChange={(e) =>
                                                            setReplyInputs({ ...replyInputs, [rev._id]: e.target.value })
                                                        }
                                                    />
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleSendReviewReply(rev._id)}
                                                    >
                                                        <FaReply className="me-1" /> Reply
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};
