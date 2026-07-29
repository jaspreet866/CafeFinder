import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { FaHeart, FaRegCommentDots, FaUserCircle } from "react-icons/fa"
import { Rating } from "react-simple-star-rating"

export const Account = () => {
    const navigate = useNavigate()
    const [wishlist, setWishlist] = useState([])
    const [reviews, setReviews] = useState([])

    const getUser = () => {
        try {
            const token = JSON.parse(localStorage.getItem("data"))

            if (!token) {
                return null
            }

            const parts = token.split(".")

            if (parts.length !== 3) {
                return null
            }

            const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/")
            return JSON.parse(atob(payload))
        }
        catch (error) {
            return null
        }
    }

    const user = getUser()
    const userEmail = user?.mail || "Guest user"
    const avatarLetter = userEmail.charAt(0).toUpperCase()

    useEffect(() => {
        const userId = user?.id

        if (!userId) {
            return
        }

        const showWishlist = async () => {
            const result = await fetch(`http://localhost:9000/api/favourite/${userId}`)
            const res = await result.json()

            if (res.statuscode === 1) {
                setWishlist(res.data)
            }
        }

        const showReviews = async () => {
            const result = await fetch(`http://localhost:9000/api/userreviews/${userId}`)
            const res = await result.json()

            if (res.statuscode === 1) {
                setReviews(res.data)
            }
        }

        showWishlist()
        showReviews()
    }, [user?.id])


    const quickActions = [
        {
            title: "Book a Table",
            text: "Reserve a cafe table for your next work session.",
            link: "/reserve"
        },
        {
            title: "Book a Space",
            text: "Request a desk, meeting room, or private office.",
            link: "/cowork"
        },
        {
            title: "Add Place",
            text: "List a cafe, room, or coworking spot on WorkWave.",
            link: "/place"
        }
    ]

    const logout = () => {
        localStorage.removeItem("data")
        navigate("/login")
    }

    return (
        <>
            <section className="account-page">
                <div className="container">
                    <div className="account-hero animate-fade-up">
                        <div className="account-avatar">
                            {user ? avatarLetter : <FaUserCircle />}
                        </div>
                        <div>
                            <p className="section-kicker">My account</p>
                            <h1>{user ? "Welcome back" : "Guest Account"}</h1>
                            <p>{userEmail}</p>
                        </div>
                        <div className="account-actions">
                            {user ? (
                                <button className="btn btn-outline-primary" type="button" onClick={logout}>
                                    Logout
                                </button>
                            ) : (
                                <Link className="btn btn-primary" to="/login">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="row g-4 mt-1">
                        <div className="col-md-6">
                            <div className="account-stat">
                                <span><FaHeart /></span>
                                <div>
                                    <h2>{wishlist.length}</h2>
                                    <p>Wishlist places</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="account-stat">
                                <span><FaRegCommentDots /></span>
                                <div>
                                    <h2>{reviews.length}</h2>
                                    <p>Reviews written</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="account-panel h-100">
                                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                                    <div>
                                        <p className="section-kicker">Next steps</p>
                                        <h2>Quick Actions</h2>
                                    </div>
                                </div>

                                <div className="account-action-list">
                                    {quickActions.map((item) => (
                                        <Link className="account-action-card" to={item.link} key={item.title}>
                                            <div>
                                                <h3>{item.title}</h3>
                                                <p>{item.text}</p>
                                            </div>
                                            <span>Open</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="account-panel h-100">
                                <p className="section-kicker">Profile</p>
                                <h2>Account Details</h2>
                                <div className="account-detail-row">
                                    <span>Email</span>
                                    <strong>{userEmail}</strong>
                                </div>
                                <div className="account-detail-row">
                                    <span>Status</span>
                                    <strong>{user ? "Logged in" : "Not logged in"}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 mt-1">
                        <div className="col-lg-6">
                            <div className="account-panel h-100">
                                <div className="account-section-head">
                                    <div>
                                        <p className="section-kicker">Wishlist</p>
                                        <h2>Saved Places</h2>
                                    </div>
                                    <Link to="/wish">View all</Link>
                                </div>

                                {wishlist.length > 0 ? (
                                    <div className="account-mini-list">
                                        {wishlist.slice(0, 3).map((item) => {
                                            const placeId = item.PlaceID || item.PlaceId || item._id

                                            return (
                                                <Link className="account-mini-card" to={`/view?id=${placeId}`} key={item._id}>
                                                    <img src={item.Image} alt={item.Placename} />
                                                    <div>
                                                        <h3>{item.Placename}</h3>
                                                        <p>Saved for later</p>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="account-empty">
                                        <p>No wishlist places yet.</p>
                                        <Link to="/" className="btn btn-primary btn-sm">Explore Places</Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="account-panel h-100">
                                <div className="account-section-head">
                                    <div>
                                        <p className="section-kicker">Reviews</p>
                                        <h2>Your Reviews</h2>
                                    </div>
                                </div>

                                {reviews.length > 0 ? (
                                    <div className="account-review-list">
                                        {reviews.slice(0, 3).map((item) => (
                                            <Link className="account-review-card" to={`/view?id=${item.ID}`} key={item._id}>
                                                <div className="d-flex align-items-center justify-content-between gap-3">
                                                    <Rating
                                                        initialValue={parseFloat(item.Rating)}
                                                        allowFraction
                                                        readonly
                                                        size={18}
                                                    />
                                                    <small>{item.Date?.split("T")[0]}</small>
                                                </div>
                                                <p>{item.Msg}</p>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="account-empty">
                                        <p>No reviews written yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
