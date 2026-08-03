import { useEffect, useState } from "react";
import { showError } from "./alerts";
import Swal from "sweetalert2";
import { 
    FaUsers, 
    FaStore, 
    FaCalendarCheck, 
    FaStar, 
    FaTrash, 
    FaCheck, 
    FaSearch, 
    FaTimes,
    FaFilter, 
    FaUserShield, 
    FaQuoteLeft, 
    FaTag, 
    FaChartLine,
    FaArrowUp,
    FaSyncAlt,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";

const ITEMS_PER_PAGE = 5;

export const Admin = () => {
    const [users, setusers] = useState(0);
    const [place, setplace] = useState(0);
    const [reserve, setreserve] = useState(0);
    const [review, setreview] = useState(0);
    
    const [alllplaces, setallplaces] = useState([]);
    const [allcat, setallcats] = useState([]);
    const [allusers, setallusers] = useState([]);
    const [reviews, setreviews] = useState([]);
    const [allreservations, setallreservations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSection, setActiveSection] = useState("dashboard");

    // Pagination State
    const [placesPage, setPlacesPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const [reservationsPage, setReservationsPage] = useState(1);

    useEffect(() => {
        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setPlacesPage(1);
        setUsersPage(1);
        setReservationsPage(1);
    }, [searchQuery]);

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([show(), show2(), show3(), show4(), show5()]);
        setLoading(false);
    };

    const show = async () => {
        try {
            const result = await fetch("https://cafefinder-u2me.onrender.com/api/getusers");
            if (result.ok) {
                const res = await result.json();
                if (res.statuscode === 1) {
                    setusers(res.data.length);
                    setallusers(res.data);
                }
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const show2 = async () => {
        try {
            const result = await fetch("https://cafefinder-u2me.onrender.com/api/showplace");
            if (result.ok) {
                const res = await result.json();
                if (res.statuscode === 1) {
                    setplace(res.data.length);
                    setallplaces(res.data);
                }
            }
        } catch (err) {
            console.error("Error fetching places:", err);
        }
    };

    const show3 = async () => {
        try {
            const result = await fetch("https://cafefinder-u2me.onrender.com/api/reservations");
            if (result.ok) {
                const res = await result.json();
                if (res.statuscode === 1) {
                    setreserve(res.data.length);
                    setallreservations(res.data);
                }
            }
        } catch (err) {
            console.error("Error fetching reservations:", err);
        }
    };

    const show4 = async () => {
        try {
            const result = await fetch("https://cafefinder-u2me.onrender.com/api/allreviews");
            if (result.ok) {
                const res = await result.json();
                if (res.statuscode === 1) {
                    setreview(res.data.length);
                    setreviews(res.data);
                }
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
        }
    };

    const show5 = async () => {
        try {
            const result = await fetch("https://cafefinder-u2me.onrender.com/api/getcat");
            if (result.ok) {
                const res = await result.json();
                if (res.statuscode === 1) {
                    setallcats(res.data);
                } else {
                    showError("Categories Not Loaded", "Please refresh the admin panel and try again.");
                }
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const updateReservationStatus = async (id, status) => {
        try {
            const result = await fetch("https://cafefinder-u2me.onrender.com/api/updatereservationstatus", {
                method: "post",
                body: JSON.stringify({ id, status }),
                headers: { "Content-type": "application/json;charset=UTF-8" }
            });
            if (result.ok) {
                const res = await result.json();
                if (res.statuscode === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Reservation Updated',
                        text: `Reservation status changed to ${status}`,
                        timer: 2000,
                        showConfirmButton: false
                    });
                    show3();
                }
            }
        } catch (err) {
            showError("Update Failed", "Unable to update reservation status.");
        }
    };

    const cancelReservationAdmin = async (id) => {
        const confirm = await Swal.fire({
            title: 'Cancel Reservation?',
            text: "This action will permanently delete this table booking.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e63946',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, cancel it!'
        });

        if (confirm.isConfirmed) {
            try {
                const result = await fetch(`https://cafefinder-u2me.onrender.com/api/cancelreservation/${id}`, {
                    method: "delete"
                });
                if (result.ok) {
                    const res = await result.json();
                    if (res.statuscode === 1) {
                        Swal.fire('Cancelled!', 'The reservation has been removed.', 'success');
                        show3();
                    }
                }
            } catch (err) {
                showError("Action Failed", "Could not cancel reservation.");
            }
        }
    };

    const removeuser = async (id) => {
        const confirm = await Swal.fire({
            title: 'Delete User?',
            text: "Are you sure you want to remove this user account?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e63946',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete'
        });

        if (confirm.isConfirmed) {
            try {
                const result = await fetch(`https://cafefinder-u2me.onrender.com/api/removeuser/${id}`, {
                    method: "delete"
                });
                if (result.ok) {
                    const res = await result.json();
                    if (res.statuscode === 1) {
                        Swal.fire('Deleted!', 'User has been removed successfully.', 'success');
                        show();
                    } else {
                        Swal.fire('Failed', 'Could not remove user.', 'error');
                    }
                }
            } catch (err) {
                showError("Error", "Server error while deleting user.");
            }
        }
    };

    const removeplace = async (id) => {
        const confirm = await Swal.fire({
            title: 'Remove Place?',
            text: "This workspace or cafe will be deleted from directory listings.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e63946',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete place'
        });

        if (confirm.isConfirmed) {
            try {
                const result = await fetch(`https://cafefinder-u2me.onrender.com/api/removeplace/${id}`, {
                    method: "delete"
                });
                if (result.ok) {
                    const res = await result.json();
                    if (res.statuscode === 1) {
                        Swal.fire('Removed!', 'Place deleted from database.', 'success');
                        show2();
                    } else {
                        Swal.fire('Error', 'Unable to delete place.', 'error');
                    }
                }
            } catch (err) {
                showError("Error", "Server error while removing place.");
            }
        }
    };

    // Filter Helpers
    const q = searchQuery.toLowerCase().trim();

    const filteredPlaces = alllplaces.filter(p => 
        !q || (p.Placename && p.Placename.toLowerCase().includes(q)) || 
        (p.Address && p.Address.toLowerCase().includes(q)) ||
        (p.City && p.City.toLowerCase().includes(q))
    );

    const filteredUsers = allusers.filter(u => 
        !q || (u.Name && u.Name.toLowerCase().includes(q)) || 
        (u.Email && u.Email.toLowerCase().includes(q)) ||
        (u.UserType && u.UserType.toLowerCase().includes(q))
    );

    const filteredReservations = allreservations.filter(r => 
        !q || (r.Name && r.Name.toLowerCase().includes(q)) || 
        (r.Email && r.Email.toLowerCase().includes(q)) ||
        (r.Placename && r.Placename.toLowerCase().includes(q))
    );

    const filteredReviews = reviews.filter(rev => 
        !q || (rev.Name && rev.Name.toLowerCase().includes(q)) ||
        (rev.Msg && rev.Msg.toLowerCase().includes(q)) ||
        (rev.Email && rev.Email.toLowerCase().includes(q))
    );

    // Paginated Arrays
    const paginatedPlaces = filteredPlaces.slice((placesPage - 1) * ITEMS_PER_PAGE, placesPage * ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice((usersPage - 1) * ITEMS_PER_PAGE, usersPage * ITEMS_PER_PAGE);
    const paginatedReservations = filteredReservations.slice((reservationsPage - 1) * ITEMS_PER_PAGE, reservationsPage * ITEMS_PER_PAGE);

    return (
        <main className="admin-page">
            <div className="container">
                <div className="admin-layout">
                    {/* Modern Sidebar Navigation */}
                    <aside className="admin-sidebar">
                        <div className="admin-brand">
                            <div className="admin-brand-icon">
                                <FaUserShield />
                            </div>
                            <div>
                                <h2 className="admin-brand-title">Control Hub</h2>
                                <span className="admin-brand-badge">WorkWave Admin</span>
                            </div>
                        </div>

                        <p className="admin-sidebar-desc">Manage users, workspace directory, reservations, and community feedback.</p>

                        <nav className="admin-nav-menu">
                            <button 
                                className={`admin-nav-item ${activeSection === "dashboard" ? "active" : ""}`}
                                onClick={() => setActiveSection("dashboard")}
                            >
                                <FaChartLine className="nav-icon" />
                                <span>Overview Dashboard</span>
                            </button>
                            <a 
                                href="#places" 
                                className={`admin-nav-item ${activeSection === "places" ? "active" : ""}`}
                                onClick={() => setActiveSection("places")}
                            >
                                <FaStore className="nav-icon" />
                                <span>Places</span>
                                <span className="admin-nav-count">{place}</span>
                            </a>
                            <a 
                                href="#categories" 
                                className={`admin-nav-item ${activeSection === "categories" ? "active" : ""}`}
                                onClick={() => setActiveSection("categories")}
                            >
                                <FaTag className="nav-icon" />
                                <span>Categories</span>
                                <span className="admin-nav-count">{allcat.length}</span>
                            </a>
                            <a 
                                href="#users" 
                                className={`admin-nav-item ${activeSection === "users" ? "active" : ""}`}
                                onClick={() => setActiveSection("users")}
                            >
                                <FaUsers className="nav-icon" />
                                <span>Users</span>
                                <span className="admin-nav-count">{users}</span>
                            </a>
                            <a 
                                href="#reviews" 
                                className={`admin-nav-item ${activeSection === "reviews" ? "active" : ""}`}
                                onClick={() => setActiveSection("reviews")}
                            >
                                <FaStar className="nav-icon" />
                                <span>Reviews</span>
                                <span className="admin-nav-count">{review}</span>
                            </a>
                            <a 
                                href="#reservations" 
                                className={`admin-nav-item ${activeSection === "reservations" ? "active" : ""}`}
                                onClick={() => setActiveSection("reservations")}
                            >
                                <FaCalendarCheck className="nav-icon" />
                                <span>Reservations</span>
                                <span className="admin-nav-count">{reserve}</span>
                            </a>
                        </nav>

                        <div className="admin-sidebar-footer">
                            <button className="btn-refresh-data" onClick={fetchAllData} title="Refresh All Data">
                                <FaSyncAlt className={loading ? "spin-icon" : ""} /> Refresh System Data
                            </button>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <section className="admin-content">
                        {/* Top Hero & Live Search Controls */}
                        <div className="admin-top-bar" id="dashboard">
                            <div className="admin-hero-text">
                                <span className="admin-pill-status"><span className="pulse-dot"></span> System Live</span>
                                <h1>Admin Command Center</h1>
                                <p>Comprehensive platform management & metrics oversight</p>
                            </div>
                            
                            <div className="admin-search-wrapper">
                                <div className="admin-search-input-group">
                                    <FaSearch className="search-icon" />
                                    <input 
                                        type="text" 
                                        className="form-control admin-search-field"
                                        placeholder="Search places, users, bookings..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Metric Stat Cards */}
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card stat-users">
                                <div className="stat-card-inner">
                                    <div className="stat-icon-box icon-users">
                                        <FaUsers />
                                    </div>
                                    <div className="stat-details">
                                        <span className="stat-label">Total Users</span>
                                        <h2 className="stat-number">{users}</h2>
                                        <div className="stat-trend positive">
                                            <FaArrowUp /> <span>Active directory</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-stat-card stat-places">
                                <div className="stat-card-inner">
                                    <div className="stat-icon-box icon-places">
                                        <FaStore />
                                    </div>
                                    <div className="stat-details">
                                        <span className="stat-label">Listed Places</span>
                                        <h2 className="stat-number">{place}</h2>
                                        <div className="stat-trend positive">
                                            <FaArrowUp /> <span>Verified spaces</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-stat-card stat-reserve">
                                <div className="stat-card-inner">
                                    <div className="stat-icon-box icon-reserve">
                                        <FaCalendarCheck />
                                    </div>
                                    <div className="stat-details">
                                        <span className="stat-label">Bookings</span>
                                        <h2 className="stat-number">{reserve}</h2>
                                        <div className="stat-trend positive">
                                            <FaArrowUp /> <span>Table requests</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-stat-card stat-reviews">
                                <div className="stat-card-inner">
                                    <div className="stat-icon-box icon-reviews">
                                        <FaStar />
                                    </div>
                                    <div className="stat-details">
                                        <span className="stat-label">User Reviews</span>
                                        <h2 className="stat-number">{review}</h2>
                                        <div className="stat-trend positive">
                                            <FaArrowUp /> <span>Feedback submissions</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Manage Places Section */}
                        <section className="admin-card-section" id="places">
                            <AdminSectionHead title="Manage Workspaces & Places" count={filteredPlaces.length} icon={<FaStore />} />
                            
                            <div className="admin-table-card">
                                <div className="table-responsive">
                                    <table className="table admin-custom-table align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>Place Name</th>
                                                <th>Address</th>
                                                <th>City</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedPlaces.length > 0 ? (
                                                paginatedPlaces.map((a) => (
                                                    <tr key={a._id || a.Placename}>
                                                        <td className="fw-bold text-dark">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className="place-avatar-badge">{a.Placename ? a.Placename.charAt(0) : "P"}</span>
                                                                <span>{a.Placename}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-secondary">{a.Address || "No address provided"}</td>
                                                        <td>
                                                            <span className="city-pill">{a.City || "General"}</span>
                                                        </td>
                                                        <td className="text-end">
                                                            <button 
                                                                className="btn-action-delete" 
                                                                onClick={() => removeplace(a._id)}
                                                                title="Delete place"
                                                            >
                                                                <FaTrash /> Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <EmptyTableRow colSpan={4} text="No matching places found." />
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <PaginationControls 
                                    currentPage={placesPage} 
                                    totalItems={filteredPlaces.length} 
                                    itemsPerPage={ITEMS_PER_PAGE} 
                                    onPageChange={setPlacesPage} 
                                />
                            </div>
                        </section>

                        {/* Manage Categories Section */}
                        <section className="admin-card-section" id="categories">
                            <AdminSectionHead title="Workspace Categories" count={allcat.length} icon={<FaTag />} />
                            
                            <div className="categories-grid-container">
                                {allcat.length > 0 ? (
                                    allcat.map((a) => (
                                        <div className="category-item-card" key={a._id || a.Type}>
                                            <div className="category-info">
                                                <span className="category-icon-bubble"><FaTag /></span>
                                                <span className="category-title">{a.Type}</span>
                                            </div>
                                            <button className="btn-category-remove" title="Remove Category">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state-box">No categories configured.</div>
                                )}
                            </div>
                        </section>

                        {/* Manage Users Section */}
                        <section className="admin-card-section" id="users">
                            <AdminSectionHead title="User Accounts Directory" count={filteredUsers.length} icon={<FaUsers />} />
                            
                            <div className="admin-table-card">
                                <div className="table-responsive">
                                    <table className="table admin-custom-table align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>User Name</th>
                                                <th>Email Address</th>
                                                <th>Account ID</th>
                                                <th>Role</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedUsers.length > 0 ? (
                                                paginatedUsers.map((a) => (
                                                    <tr key={a._id}>
                                                        <td>
                                                            <div className="admin-user-identity">
                                                                <span className="user-avatar-circle">
                                                                    {a.Name ? a.Name.charAt(0).toUpperCase() : "U"}
                                                                </span>
                                                                <span className="fw-semibold text-dark">{a.Name || "Unnamed User"}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-muted">{a.Email}</td>
                                                        <td className="user-id-mono">{a._id}</td>
                                                        <td>
                                                            <span className={`role-badge ${a.UserType === "admin" ? "role-admin" : "role-user"}`}>
                                                                {a.UserType || "User"}
                                                            </span>
                                                        </td>
                                                        <td className="text-end">
                                                            <div className="d-flex justify-content-end gap-2">
                                                                <button 
                                                                    className="btn-action-delete"
                                                                    onClick={() => removeuser(a._id)}
                                                                >
                                                                    <FaTrash /> Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <EmptyTableRow colSpan={5} text="No matching user accounts found." />
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <PaginationControls 
                                    currentPage={usersPage} 
                                    totalItems={filteredUsers.length} 
                                    itemsPerPage={ITEMS_PER_PAGE} 
                                    onPageChange={setUsersPage} 
                                />
                            </div>
                        </section>

                        {/* User Reviews & Feedback */}
                        <section className="admin-card-section" id="reviews">
                            <AdminSectionHead title="Community Reviews & Feedback" count={filteredReviews.length} icon={<FaStar />} />
                            
                            <div className="reviews-grid">
                                {filteredReviews.length > 0 ? (
                                    filteredReviews.map((a) => (
                                        <div className="admin-review-card-item" key={a._id || `${a.Email}-${a.UserID}`}>
                                            <div className="review-card-header">
                                                <div className="review-author-box">
                                                    <div className="author-avatar">
                                                        {a.Name ? a.Name.charAt(0).toUpperCase() : "R"}
                                                    </div>
                                                    <div>
                                                        <h4 className="author-name">{a.Name || "Anonymous"}</h4>
                                                        <p className="author-email">{a.Email}</p>
                                                    </div>
                                                </div>
                                                <div className="review-stars">
                                                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                                </div>
                                            </div>
                                            <div className="review-body">
                                                <FaQuoteLeft className="quote-icon" />
                                                <p className="review-text">{a.Msg || "No feedback message provided."}</p>
                                            </div>
                                            <div className="review-footer">
                                                <span className="user-id-pill">UserID: {a.UserID}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state-box w-100">No matching reviews found.</div>
                                )}
                            </div>
                        </section>

                        {/* Table Reservations Management */}
                        <section className="admin-card-section" id="reservations">
                            <AdminSectionHead title="Table Reservations & Bookings" count={filteredReservations.length} icon={<FaCalendarCheck />} />
                            
                            <div className="admin-table-card">
                                <div className="table-responsive">
                                    <table className="table admin-custom-table align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>Workspace / Place</th>
                                                <th>Customer Details</th>
                                                <th>Date & Slot</th>
                                                <th>Guests</th>
                                                <th>Status</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedReservations.length > 0 ? (
                                                paginatedReservations.map((a) => (
                                                    <tr key={a._id}>
                                                        <td className="fw-bold text-dark">{a.Placename || "General Table"}</td>
                                                        <td>
                                                            <div className="customer-info-box">
                                                                <strong>{a.Name || "Guest"}</strong>
                                                                <div className="text-muted small">{a.Email} | {a.Phone || "N/A"}</div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="date-slot-box">
                                                                <span className="fw-medium">{a.Date}</span>
                                                                <small className="text-muted d-block">{a.TimeSlot || "Standard Slot"}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="guest-badge">{a.Guests || 1} Guests</span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-pill ${a.Status === "Confirmed" ? "status-confirmed" : "status-pending"}`}>
                                                                {a.Status || "Pending"}
                                                            </span>
                                                        </td>
                                                        <td className="text-end">
                                                            <div className="d-flex justify-content-end gap-2">
                                                                {a.Status !== "Confirmed" && (
                                                                    <button 
                                                                        className="btn-action-confirm"
                                                                        onClick={() => updateReservationStatus(a._id, "Confirmed")}
                                                                    >
                                                                        <FaCheck /> Confirm
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    className="btn-action-delete"
                                                                    onClick={() => cancelReservationAdmin(a._id)}
                                                                >
                                                                    <FaTrash /> Cancel
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <EmptyTableRow colSpan={6} text="No matching table reservations found." />
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <PaginationControls 
                                    currentPage={reservationsPage} 
                                    totalItems={filteredReservations.length} 
                                    itemsPerPage={ITEMS_PER_PAGE} 
                                    onPageChange={setReservationsPage} 
                                />
                            </div>
                        </section>
                    </section>
                </div>
            </div>
        </main>
    );
};

const AdminSectionHead = ({ title, count, icon }) => (
    <div className="admin-section-header">
        <div className="d-flex align-items-center gap-3">
            <span className="section-head-icon">{icon}</span>
            <div>
                <h3 className="section-title">{title}</h3>
                <span className="section-subtitle">Showing {count} entries</span>
            </div>
        </div>
    </div>
);

const EmptyTableRow = ({ colSpan, text }) => (
    <tr>
        <td colSpan={colSpan} className="text-center py-4 text-muted">
            <div className="empty-table-state">
                <FaFilter className="mb-2 text-secondary" style={{ fontSize: '1.5rem' }} />
                <p className="mb-0">{text}</p>
            </div>
        </td>
    </tr>
);

const PaginationControls = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="admin-pagination-wrapper">
            <span className="pagination-info">
                Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
            </span>
            <div className="pagination-buttons">
                <button 
                    className="btn-pagination-nav" 
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    title="Previous Page"
                >
                    <FaChevronLeft />
                </button>
                {pages.map(num => (
                    <button 
                        key={num}
                        className={`btn-pagination-page ${currentPage === num ? "active" : ""}`}
                        onClick={() => onPageChange(num)}
                    >
                        {num}
                    </button>
                ))}
                <button 
                    className="btn-pagination-nav" 
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    title="Next Page"
                >
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};
