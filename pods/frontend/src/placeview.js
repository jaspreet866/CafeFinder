import { useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate, useParams } from "react-router-dom";
import { Rating } from "react-simple-star-rating";
import AOS from "aos";
import { FaThumbsUp, FaCamera, FaTimes, FaUtensils, FaCommentDots, FaShoppingBag, FaPlus, FaMinus, FaCheckCircle, FaReply } from "react-icons/fa";
import { Context } from "./usecontext";
import { showError, showInfo, showSuccess } from "./alerts";
import { getApiUrl } from "./apiConfig";

// Default menu items fallback if owner hasn't populated menu yet
const DEFAULT_MENU_ITEMS = [
    {
        _id: "def_1",
        Name: "Artisan Cappuccino",
        Category: "Coffee & Espresso",
        Price: 180,
        Description: "Double espresso with silky steamed whole milk & microfoam art.",
        IsVeg: true,
        InStock: true,
        Image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80"
    },
    {
        _id: "def_2",
        Name: "Single Origin Cold Brew",
        Category: "Cold Drinks",
        Price: 220,
        Description: "Steeped for 18 hours in cold filtered water. Notes of dark chocolate and caramel.",
        IsVeg: true,
        InStock: true,
        Image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80"
    },
    {
        _id: "def_3",
        Name: "Avocado Sourdough Toast",
        Category: "Food & Bites",
        Price: 290,
        Description: "Crushed Hass avocado on toasted artisan sourdough with cherry tomatoes & chili flakes.",
        IsVeg: true,
        InStock: true,
        Image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80"
    },
    {
        _id: "def_4",
        Name: "Nutella Brioche French Toast",
        Category: "Bakery & Sweets",
        Price: 260,
        Description: "Golden brioche infused with cinnamon egg wash, filled with warm Nutella & fresh berries.",
        IsVeg: true,
        InStock: true,
        Image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80"
    },
    {
        _id: "def_5",
        Name: "Japanese Matcha Iced Latte",
        Category: "Cold Drinks",
        Price: 240,
        Description: "Ceremonial grade Uji matcha whisked with oat milk and honey vanilla drizzle.",
        IsVeg: true,
        InStock: true,
        Image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80"
    },
    {
        _id: "def_6",
        Name: "Truffle Cheese Melt Panini",
        Category: "Food & Bites",
        Price: 320,
        Description: "Three-cheese blend, sauteed wild mushrooms, and black truffle oil in grilled focaccia.",
        IsVeg: true,
        InStock: true,
        Image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80"
    }
];

export const PlaceView = () => {
    const [img, setimg] = useState();
    const [name, setname] = useState("");
    const [img2, setimg2] = useState("");
    const [img3, setimg3] = useState("");
    const [img4, setimg4] = useState("");
    const [address, setaddress] = useState("");
    const [type, settype] = useState("");
    const [meeting, setMeeting] = useState(false);
    const [about, setAbout] = useState("");
    const [gaming, setGaming] = useState(false);
    const [wifi, setwifi] = useState(false);
    const [rating, setRating] = useState("");
    const [rating2, setRating2] = useState(5);
    const [showreview, setshowreview] = useState([]);
    const [user, setuser] = useState("");
    const [usermail, setusermail] = useState("");
    const [city, setcity] = useState("");
    const [msg, setmsg] = useState("");
    
    // Feature #4: Digital Menu & Pre-Ordering
    const [menuItems, setMenuItems] = useState([]);
    const [activeMenuTab, setActiveMenuTab] = useState("All");
    const [cart, setCart] = useState({}); // { [id]: { name, price, qty } }

    // Feature #5: Review Photos, Likes & Replies
    const [reviewFiles, setReviewFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [lightboxImg, setLightboxImg] = useState(null);
    const [replyTextMap, setReplyTextMap] = useState({});
    const [submittingReview, setSubmittingReview] = useState(false);

    // Active Section Tab (Overview / Digital Menu / Reviews)
    const [activeSection, setActiveSection] = useState("overview");

    const { id, utype } = useContext(Context);
    const [pr] = useSearchParams();
    const navigate = useNavigate();
    const params = useParams();
    const prr = pr.get("id") || params.id;

    // Load Place Details
    const show = useCallback(async () => {
        try {
            const result = await fetch(getApiUrl(`/api/showplace2/${prr}`));
            const res = await result.json();

            if (res.statuscode === 1 && res.data) {
                setname(res.data.Placename);
                setimg(res.data.Image?.[0]);
                setimg2(res.data.Image?.[1]);
                setimg3(res.data.Image?.[2]);
                setimg4(res.data.Image?.[3]);
                setAbout(res.data.About);
                setGaming(res.data.Gaming);
                setMeeting(res.data.Meeting);
                setcity(res.data.City);
                setwifi(res.data.WiFi);
                setRating(res.data.Rating);
                setaddress(res.data.Address);
                settype(res.data.Type);
            }
        } catch (err) {
            console.error("Failed to load place:", err);
        }
    }, [prr]);

    // Load Reviews
    const show2 = useCallback(async () => {
        try {
            const result = await fetch(getApiUrl(`/api/getreview/${prr}`));
            const res = await result.json();

            if (res.statuscode === 1) {
                setshowreview(res.data || []);
            }
        } catch (err) {
            console.error("Failed to load reviews:", err);
        }
    }, [prr]);

    // Load Digital Menu (Feature #4)
    const loadMenu = useCallback(async () => {
        try {
            const res = await fetch(getApiUrl(`/api/menu/${prr}`));
            const data = await res.json();
            if (data.statuscode === 1 && data.data && data.data.length > 0) {
                setMenuItems(data.data);
            } else {
                setMenuItems(DEFAULT_MENU_ITEMS);
            }
        } catch (err) {
            setMenuItems(DEFAULT_MENU_ITEMS);
        }
    }, [prr]);

    useEffect(() => {
        if (prr) {
            if (!id) {
                showInfo("Login Recommended", "Login to save favorites or leave reviews.");
            }
            show();
            show2();
            loadMenu();
        }
    }, [id, prr, show, show2, loadMenu]);

    useEffect(() => {
        AOS.refresh();
    }, [name, showreview, menuItems]);

    // Handle Review Photo Selection
    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + reviewFiles.length > 3) {
            showInfo("Photo Limit", "You can upload up to 3 photos with your review.");
            return;
        }

        const newFiles = [...reviewFiles, ...files].slice(0, 3);
        setReviewFiles(newFiles);

        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
        setPreviewUrls(newPreviews);
    };

    const removePhoto = (index) => {
        const newFiles = reviewFiles.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        setReviewFiles(newFiles);
        setPreviewUrls(newPreviews);
    };

    // Submit Review with Photos (Feature #5)
    const send = async (e) => {
        e.preventDefault();

        if (!user || !usermail || !msg) {
            showInfo("Incomplete Review", "Please provide your name, email, and feedback message.");
            return;
        }

        setSubmittingReview(true);
        try {
            const formData = new FormData();
            formData.append("user", user);
            formData.append("usermail", usermail);
            formData.append("rating2", rating2);
            formData.append("msg", msg);
            formData.append("prr", prr);
            formData.append("id", id || "");

            reviewFiles.forEach((file) => {
                formData.append("images", file);
            });

            const result = await fetch(getApiUrl("/api/review"), {
                method: "POST",
                body: formData,
            });

            const res = await result.json();

            if (res.statuscode === 1) {
                showSuccess("Review Submitted", "Thank you for sharing your experience & photos!");
                show2();
                setuser("");
                setusermail("");
                setmsg("");
                setReviewFiles([]);
                setPreviewUrls([]);
            } else {
                showError("Submission Failed", "Could not submit review. Please try again.");
            }
        } catch (err) {
            showError("Error", "Network error while submitting review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Toggle Review Like / Reaction (Feature #5)
    const handleLike = async (reviewId) => {
        try {
            const res = await fetch(getApiUrl(`/api/review/${reviewId}/like`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: id || "guest_user" }),
            });
            const data = await res.json();
            if (data.statuscode === 1) {
                setshowreview((prev) =>
                    prev.map((r) =>
                        r._id === reviewId
                            ? {
                                  ...r,
                                  Likes: data.likes,
                                  LikedBy: data.liked
                                      ? [...(r.LikedBy || []), id || "guest_user"]
                                      : (r.LikedBy || []).filter((u) => u !== (id || "guest_user")),
                              }
                            : r
                    )
                );
            }
        } catch (err) {
            console.error("Like failed:", err);
        }
    };

    // Owner Reply to Review (Feature #5 & #6)
    const handleOwnerReply = async (reviewId) => {
        const text = replyTextMap[reviewId];
        if (!text || text.trim() === "") return;

        try {
            const res = await fetch(getApiUrl(`/api/review/${reviewId}/reply`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reply: text }),
            });
            const data = await res.json();
            if (data.statuscode === 1) {
                showSuccess("Reply Posted", "Your response is now visible to customers.");
                setReplyTextMap((prev) => ({ ...prev, [reviewId]: "" }));
                show2();
            }
        } catch (err) {
            showError("Reply Error", "Failed to post reply.");
        }
    };

    // Wishlist Toggle
    const handleFavorite = async () => {
        const result = await fetch(getApiUrl("/api/wishlist"), {
            method: "post",
            body: JSON.stringify({ id, prr, name, img, type, address, city }),
            headers: { "Content-type": "application/json;charset=UTF-8" },
        });
        if (result) {
            const res = await result.json();
            if (res.statuscode === 1) {
                showSuccess("Added to Wishlist", "This place is now saved in your wishlist.");
                navigate(`/wish?id=${id}`);
            } else {
                showError("Wishlist Failed", "Please login or try again.");
            }
        }
    };

    // Cart Handlers for Pre-ordering (Feature #4)
    const addToCart = (item) => {
        setCart((prev) => {
            const currentQty = prev[item._id]?.qty || 0;
            return {
                ...prev,
                [item._id]: {
                    id: item._id,
                    name: item.Name,
                    price: item.Price,
                    qty: currentQty + 1,
                },
            };
        });
    };

    const removeFromCart = (itemId) => {
        setCart((prev) => {
            const current = prev[itemId];
            if (!current) return prev;
            if (current.qty <= 1) {
                const copy = { ...prev };
                delete copy[itemId];
                return copy;
            }
            return {
                ...prev,
                [itemId]: { ...current, qty: current.qty - 1 },
            };
        });
    };

    const cartItems = Object.values(cart);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

    // Proceed to Reservation with Pre-Ordered Menu Items
    const handleProceedToBooking = () => {
        const queryParams = new URLSearchParams({
            placeId: prr,
            name: name || "",
            preOrderTotal: cartTotal,
            preOrderItems: JSON.stringify(cartItems),
        });
        navigate(`/reserve?${queryParams.toString()}`);
    };

    // Distinct Menu Categories
    const categories = ["All", ...new Set(menuItems.map((item) => item.Category || "Other"))];
    const filteredMenuItems =
        activeMenuTab === "All"
            ? menuItems
            : menuItems.filter((item) => item.Category === activeMenuTab);

    return (
        <>
            <div className="container py-5 place-detail">
                {/* HERO OVERVIEW */}
                <div className="row g-4 g-lg-5 align-items-start">
                    {/* LEFT SIDE: PHOTO GALLERY */}
                    <div className="col-lg-6" data-aos="fade-right">
                        <div className="main-image-frame rounded-4 overflow-hidden shadow">
                            <img
                                src={img || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"}
                                alt={name}
                                className="img-fluid main-img w-100"
                                style={{ maxHeight: "420px", objectFit: "cover" }}
                            />
                        </div>
                        <div className="row g-2 g-md-3 mt-2">
                            {[img2, img3, img4].filter(Boolean).map((item, index) => (
                                <div className="col-4" key={index}>
                                    <div className="sub-img-frame rounded-3 overflow-hidden shadow-sm">
                                        <img
                                            src={item}
                                            alt="gallery"
                                            className="img-fluid sub-img w-100"
                                            style={{ height: "100px", objectFit: "cover" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE: DETAILS & CTA */}
                    <div className="col-lg-6" data-aos="fade-left">
                        <span className="section-kicker">Verified Workspace</span>
                        <h1 className="fw-bold detail-title display-6 mb-2">{name}</h1>
                        <div className="my-2 d-flex align-items-center gap-2">
                            <Rating initialValue={parseFloat(rating) || 4.5} allowFraction readonly size={24} />
                            <span className="fw-semibold text-muted">({rating || "4.5"} / 5)</span>
                        </div>

                        <p className="about-text text-secondary mt-3">{about}</p>

                        <div className="d-flex flex-wrap gap-2 mt-3">
                            <span className={`feature-badge ${gaming ? "active-feature" : "inactive-feature"}`}>
                                🎮 Gaming {gaming ? "Allowed" : "Not Allowed"}
                            </span>
                            <span className={`feature-badge ${meeting ? "active-feature" : "inactive-feature"}`}>
                                👥 Meetings {meeting ? "Allowed" : "Not Allowed"}
                            </span>
                            <span className={`feature-badge ${wifi ? "active-feature" : "inactive-feature"}`}>
                                ⚡ WiFi {wifi ? "Available" : "Unavailable"}
                            </span>
                        </div>

                        <p className="mt-3 detail-address text-muted">
                            <span className="fw-semibold text-emphasis">Address: </span>
                            {address || "Prime City Location"} {city ? `• ${city}` : ""}
                        </p>

                        {/* ACTION BUTTONS */}
                        <div className="d-flex align-items-center gap-3 mt-4">
                            <button
                                className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                                onClick={() => setActiveSection("menu")}
                            >
                                <FaUtensils /> View Digital Menu
                            </button>

                            <Link to={`/reserve?placeId=${prr}&name=${encodeURIComponent(name)}`}>
                                <button className="btn btn-outline-primary px-4 py-2">
                                    Direct Table Booking
                                </button>
                            </Link>

                            <button
                                className="btn btn-outline-danger p-2 rounded-circle"
                                onClick={handleFavorite}
                                title="Add to wishlist"
                            >
                                <i className="fa-sharp-duotone fa-solid fa-heart fs-5"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABS NAVIGATION: Overview / Digital Menu / Reviews */}
                <div className="row mt-5">
                    <div className="col-12">
                        <ul className="nav nav-pills detail-tabs gap-2 border-bottom pb-3">
                            <li className="nav-item">
                                <button
                                    className={`nav-link px-4 py-2 fw-semibold ${activeSection === "overview" ? "active" : ""}`}
                                    onClick={() => setActiveSection("overview")}
                                >
                                    Overview
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link px-4 py-2 fw-semibold position-relative ${activeSection === "menu" ? "active" : ""}`}
                                    onClick={() => setActiveSection("menu")}
                                >
                                    <FaUtensils className="me-2" /> Digital Menu
                                    {cartCount > 0 && (
                                        <span className="badge rounded-pill bg-danger ms-2">
                                            {cartCount} in tray
                                        </span>
                                    )}
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link px-4 py-2 fw-semibold ${activeSection === "reviews" ? "active" : ""}`}
                                    onClick={() => setActiveSection("reviews")}
                                >
                                    <FaCommentDots className="me-2" /> Customer Reviews ({showreview.length})
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* TAB 1: DIGITAL MENU & PRE-ORDERING (Feature #4) */}
                {activeSection === "menu" && (
                    <div className="row mt-4 g-4" data-aos="fade-up">
                        <div className="col-lg-8">
                            <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                                <div>
                                    <h3 className="fw-bold mb-1">Digital Cafe Menu</h3>
                                    <p className="text-muted small mb-0">
                                        Browse fresh brews & bites. Add to your pre-order tray to have them ready when your table is booked!
                                    </p>
                                </div>
                            </div>

                            {/* Menu Categories Pills */}
                            <div className="d-flex flex-wrap gap-2 mb-4">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        className={`btn btn-sm rounded-pill px-3 py-1 ${activeMenuTab === cat ? "btn-primary" : "btn-outline-secondary"}`}
                                        onClick={() => setActiveMenuTab(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Menu Grid */}
                            <div className="row g-3">
                                {filteredMenuItems.map((item) => {
                                    const qty = cart[item._id]?.qty || 0;
                                    return (
                                        <div className="col-md-6" key={item._id}>
                                            <div className="card h-100 border-0 shadow-sm p-3 rounded-4 menu-item-card transition-all">
                                                <div className="d-flex gap-3 align-items-start">
                                                    <img
                                                        src={item.Image || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300"}
                                                        alt={item.Name}
                                                        className="rounded-3 object-fit-cover"
                                                        style={{ width: "85px", height: "85px" }}
                                                    />
                                                    <div className="flex-grow-1 min-w-0">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className={`veg-dot ${item.IsVeg ? "veg" : "non-veg"}`} title={item.IsVeg ? "Vegetarian" : "Non-Veg"}></span>
                                                            <h6 className="fw-bold text-truncate mb-0">{item.Name}</h6>
                                                        </div>
                                                        <span className="text-primary fw-bold fs-6">₹{item.Price}</span>
                                                        <p className="text-muted small mb-2 line-clamp-2" style={{ fontSize: "0.82rem" }}>
                                                            {item.Description}
                                                        </p>

                                                        {/* Quantity / Add Button */}
                                                        {qty > 0 ? (
                                                            <div className="d-flex align-items-center gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary rounded-circle p-1 d-flex align-items-center justify-content-center"
                                                                    style={{ width: "26px", height: "26px" }}
                                                                    onClick={() => removeFromCart(item._id)}
                                                                >
                                                                    <FaMinus size={10} />
                                                                </button>
                                                                <span className="fw-bold px-2">{qty}</span>
                                                                <button
                                                                    className="btn btn-sm btn-primary rounded-circle p-1 d-flex align-items-center justify-content-center"
                                                                    style={{ width: "26px", height: "26px" }}
                                                                    onClick={() => addToCart(item)}
                                                                >
                                                                    <FaPlus size={10} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                                                                onClick={() => addToCart(item)}
                                                            >
                                                                + Add to Pre-order
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pre-Order Summary Tray (Right column) */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow rounded-4 p-4 sticky-top" style={{ top: "90px" }}>
                                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                        <FaShoppingBag className="text-primary" /> Pre-Order Tray
                                    </h5>
                                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1">
                                        {cartCount} items
                                    </span>
                                </div>

                                {cartItems.length === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        <p className="mb-0">Your pre-order tray is empty.</p>
                                        <small>Pick items from the menu to have coffee and snacks served when you arrive.</small>
                                    </div>
                                ) : (
                                    <>
                                        <div className="tray-items-list mb-3" style={{ maxHeight: "250px", overflowY: "auto" }}>
                                            {cartItems.map((cartItem) => (
                                                <div key={cartItem.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                                    <div>
                                                        <span className="fw-semibold small d-block">{cartItem.name}</span>
                                                        <small className="text-muted">₹{cartItem.price} &times; {cartItem.qty}</small>
                                                    </div>
                                                    <span className="fw-bold">₹{cartItem.price * cartItem.qty}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center py-2 border-top fw-bold fs-5 mb-3">
                                            <span>Subtotal:</span>
                                            <span className="text-primary">₹{cartTotal}</span>
                                        </div>

                                        <button
                                            className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                            onClick={handleProceedToBooking}
                                        >
                                            <FaCheckCircle /> Reserve Table with Pre-Order
                                        </button>
                                        <small className="text-muted text-center d-block mt-2">
                                            Items will be reserved alongside your table booking.
                                        </small>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: OVERVIEW & AMENITIES */}
                {activeSection === "overview" && (
                    <div className="row mt-4 g-4" data-aos="fade-up">
                        <div className="col-lg-8">
                            <h4 className="fw-bold mb-3">About This Workspace</h4>
                            <p className="text-muted lead" style={{ fontSize: "1.05rem" }}>
                                {about || "Experience an inspiring environment crafted for remote workers, freelancers, and creative minds. Fast fiber internet, comfortable ergonomic seating, and specialty cafe beverages."}
                            </p>

                            <h5 className="fw-bold mt-4 mb-3">Workspace Amenities</h5>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="p-3 bg-light-subtle rounded-3 border">
                                        <h6 className="fw-bold mb-1">⚡ Ultra-fast Wi-Fi</h6>
                                        <small className="text-muted">High-speed dual-band fiber connection</small>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light-subtle rounded-3 border">
                                        <h6 className="fw-bold mb-1">🔌 Power Outlets</h6>
                                        <small className="text-muted">Universal sockets accessible per seat</small>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light-subtle rounded-3 border">
                                        <h6 className="fw-bold mb-1">☕ Coffee & Snacks</h6>
                                        <small className="text-muted">Specialty roast & artisanal snacks</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: CUSTOMER REVIEWS & PHOTO UPLOADS (Feature #5) */}
                {(activeSection === "reviews" || activeSection === "overview") && (
                    <div className="row mt-5 g-5" id="reviews-section">
                        {/* WRITE A REVIEW FORM */}
                        <div className="col-lg-5" data-aos="fade-up">
                            <div className="review-form shadow-lg p-4 rounded-4 bg-card">
                                <h4 className="fw-bold mb-2">Write a Review</h4>
                                <p className="text-muted small mb-4">
                                    Share your experience and upload photos of your visit!
                                </p>

                                <form onSubmit={send}>
                                    <input
                                        className="form-control custom-input mb-3"
                                        type="text"
                                        placeholder="Your Name"
                                        value={user}
                                        onChange={(e) => setuser(e.target.value)}
                                        required
                                    />
                                    <input
                                        className="form-control custom-input mb-3"
                                        type="email"
                                        placeholder="Your Email"
                                        value={usermail}
                                        onChange={(e) => setusermail(e.target.value)}
                                        required
                                    />
                                    <textarea
                                        className="form-control custom-input mb-3"
                                        rows="4"
                                        placeholder="Tell us about the coffee, internet speed, ambience..."
                                        value={msg}
                                        onChange={(e) => setmsg(e.target.value)}
                                        required
                                    ></textarea>

                                    {/* Star Rating Selector */}
                                    <div className="mb-3">
                                        <label className="fw-semibold small d-block mb-1">Overall Rating</label>
                                        <Rating onClick={(r) => setRating2(r)} allowFraction initialValue={5} />
                                    </div>

                                    {/* PHOTO UPLOADER (Feature #5) */}
                                    <div className="mb-4">
                                        <label className="fw-semibold small d-block mb-1">
                                            <FaCamera className="me-1 text-primary" /> Add Photos (up to 3)
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control form-control-sm"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotoChange}
                                        />

                                        {/* Thumbnail Previews */}
                                        {previewUrls.length > 0 && (
                                            <div className="d-flex gap-2 mt-2">
                                                {previewUrls.map((url, idx) => (
                                                    <div key={idx} className="position-relative">
                                                        <img
                                                            src={url}
                                                            alt="preview"
                                                            className="rounded-3 object-fit-cover"
                                                            style={{ width: "60px", height: "60px" }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                            style={{ width: "18px", height: "18px", transform: "translate(30%, -30%)" }}
                                                            onClick={() => removePhoto(idx)}
                                                        >
                                                            <FaTimes size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                        type="submit"
                                        disabled={submittingReview}
                                    >
                                        {submittingReview ? "Submitting Review..." : "Post Verified Review"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* REVIEWS LIST */}
                        <div className="col-lg-7" data-aos="fade-up" data-aos-delay="100">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h3 className="fw-bold mb-0">Customer Experiences</h3>
                                <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill">
                                    {showreview.length} Reviews
                                </span>
                            </div>

                            {showreview.length === 0 ? (
                                <div className="text-center py-5 border rounded-4 p-4 text-muted">
                                    <h5>No Reviews Yet</h5>
                                    <p className="mb-0">Be the first to share your experience with this workspace!</p>
                                </div>
                            ) : (
                                showreview.map((rev) => {
                                    const isLiked = rev.LikedBy?.includes(id || "guest_user");
                                    return (
                                        <div key={rev._id} className="review-card p-4 mb-3 rounded-4 shadow-sm border bg-card">
                                            <div className="d-flex justify-content-between align-items-start gap-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5" style={{ width: "45px", height: "45px" }}>
                                                        {rev.Name?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 fw-bold">{rev.Name}</h6>
                                                        <Rating initialValue={parseFloat(rev.Rating) || 5} allowFraction readonly size={16} />
                                                    </div>
                                                </div>
                                                <small className="text-muted">
                                                    {rev.Date ? rev.Date.split("T")[0] : "Recent"}
                                                </small>
                                            </div>

                                            <p className="review-msg mt-3 text-secondary mb-2">{rev.Msg}</p>

                                            {/* USER UPLOADED REVIEW PHOTOS (Feature #5) */}
                                            {rev.Images && rev.Images.length > 0 && (
                                                <div className="d-flex flex-wrap gap-2 my-3">
                                                    {rev.Images.map((photoUrl, pIdx) => (
                                                        <img
                                                            key={pIdx}
                                                            src={photoUrl}
                                                            alt="Review attachment"
                                                            className="rounded-3 object-fit-cover cursor-pointer hover-zoom"
                                                            style={{ width: "80px", height: "80px", border: "1px solid #ddd" }}
                                                            onClick={() => setLightboxImg(photoUrl)}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* REACTION & HELPFUL BUTTON (Feature #5) */}
                                            <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
                                                <button
                                                    className={`btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3 ${
                                                        isLiked ? "btn-primary" : "btn-outline-secondary"
                                                    }`}
                                                    onClick={() => handleLike(rev._id)}
                                                >
                                                    <FaThumbsUp size={12} />
                                                    <span>Helpful ({rev.Likes || 0})</span>
                                                </button>

                                                <small className="text-muted">Verified Visitor</small>
                                            </div>

                                            {/* CAFE OWNER REPLY (Feature #5 & #6) */}
                                            {rev.OwnerReply && (
                                                <div className="owner-reply-box mt-3 p-3 rounded-3 bg-light border-start border-primary border-3">
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <span className="badge bg-primary text-white">Owner Response</span>
                                                        <small className="text-muted">
                                                            {rev.OwnerReply.replyDate ? rev.OwnerReply.replyDate.split("T")[0] : ""}
                                                        </small>
                                                    </div>
                                                    <p className="mb-0 small text-secondary fst-italic">
                                                        "{rev.OwnerReply.text}"
                                                    </p>
                                                </div>
                                            )}

                                            {/* OWNER REPLY INPUT (If current logged-in user is an Owner) */}
                                            {utype === "Owner" && !rev.OwnerReply && (
                                                <div className="mt-3 pt-2">
                                                    <div className="input-group input-group-sm">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Reply as cafe owner..."
                                                            value={replyTextMap[rev._id] || ""}
                                                            onChange={(e) =>
                                                                setReplyTextMap({ ...replyTextMap, [rev._id]: e.target.value })
                                                            }
                                                        />
                                                        <button
                                                            className="btn btn-dark"
                                                            onClick={() => handleOwnerReply(rev._id)}
                                                        >
                                                            <FaReply className="me-1" /> Send Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* LIGHTBOX MODAL FOR REVIEW PHOTOS */}
            {lightboxImg && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1060 }}
                    onClick={() => setLightboxImg(null)}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-transparent border-0 position-relative text-center">
                            <button
                                type="button"
                                className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                                onClick={() => setLightboxImg(null)}
                            ></button>
                            <img
                                src={lightboxImg}
                                alt="Expanded view"
                                className="img-fluid rounded-4 shadow-lg mx-auto"
                                style={{ maxHeight: "80vh", objectFit: "contain" }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
