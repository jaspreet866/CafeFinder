import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "./usecontext";
import { showSuccess, showError } from "./alerts";
import { getApiUrl } from "./apiConfig";
import { FaTrash, FaMapMarkerAlt, FaHeart, FaExternalLinkAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export const Wishlist = () => {
    const [d, setd] = useState([]);
    const [loading, setLoading] = useState(true);
    const { id } = useContext(Context);

    const show = useCallback(async () => {
        try {
            setLoading(true);
            const result = await fetch(getApiUrl(`/api/favourite/${id}`), {
                method: "get"
            });
            if (result) {
                const res = await result.json();
                if (res.statuscode === 1) {
                    setd(res.data || []);
                } else {
                    setd([]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            show();
        } else {
            setLoading(false);
        }
    }, [id, show]);

    const removeFromWishlist = async (itemId, placename) => {
        const confirm = await Swal.fire({
            title: 'Remove from Wishlist?',
            text: `Remove "${placename || 'this place'}" from your saved places?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#e63946',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, remove'
        });

        if (confirm.isConfirmed) {
            try {
                const res = await fetch(getApiUrl(`/api/wishlist/${itemId}`), {
                    method: "delete"
                });
                const data = await res.json();
                if (data.statuscode === 1) {
                    setd(prev => prev.filter(item => item._id !== itemId));
                    showSuccess("Removed", "Place removed from your wishlist.");
                } else {
                    showError("Error", "Could not remove from wishlist.");
                }
            } catch (err) {
                showError("Network Error", "Unable to remove wishlist item.");
            }
        }
    };

    return (
        <section className="wishlist-page py-5">
            <div className="container">
                <div className="wishlist-header d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div>
                        <p className="section-kicker mb-1">Saved Collections</p>
                        <h1 className="h2 mb-0 d-flex align-items-center gap-2">
                            <FaHeart className="text-danger" style={{ fontSize: '1.6rem' }} /> Your Wishlist
                        </h1>
                    </div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6">
                        {d.length} Saved {d.length === 1 ? "Place" : "Places"}
                    </span>
                </div>

                {!id ? (
                    <div className="wishlist-empty text-center py-5">
                        <div className="empty-icon-wrap mb-3">
                            <FaHeart className="text-muted" style={{ fontSize: '3rem', opacity: 0.4 }} />
                        </div>
                        <h3>Please Sign In</h3>
                        <p className="text-muted">Sign in to your account to view and manage your saved cafes & workspaces.</p>
                        <Link to="/login" className="btn btn-primary px-4 mt-2">Sign In</Link>
                    </div>
                ) : loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading wishlist...</span>
                        </div>
                        <p className="text-muted mt-2">Loading your favorite places...</p>
                    </div>
                ) : d.length === 0 ? (
                    <div className="wishlist-empty text-center py-5">
                        <div className="empty-icon-wrap mb-3">
                            <FaHeart className="text-muted" style={{ fontSize: '3.5rem', opacity: 0.3 }} />
                        </div>
                        <h2>No saved places yet</h2>
                        <p className="text-muted max-w-500 mx-auto">
                            Browse places and tap the bookmark or heart icon on any cafe or workspace to keep it handy for future visits.
                        </p>
                        <div className="d-flex justify-content-center gap-3 mt-4">
                            <Link to="/" className="btn btn-primary px-4">Explore Places</Link>
                            <Link to="/map" className="btn btn-outline-primary px-4">Find on Map</Link>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {d.map((a) => {
                            const placeId = a.PlaceID || a.PlaceId || a._id;

                            return (
                                <div className="col-12 col-sm-6 col-lg-4" key={a._id}>
                                    <article className="wishlist-card card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                                        <div className="wishlist-image-wrap position-relative" style={{ height: '220px', overflow: 'hidden' }}>
                                            <img 
                                                src={a.Image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800"} 
                                                className="wishlist-img w-100 h-100 object-fit-cover" 
                                                alt={a.Placename} 
                                            />
                                            <button 
                                                className="btn btn-light btn-sm position-absolute top-0 end-0 m-3 rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center text-danger border-0"
                                                onClick={() => removeFromWishlist(a._id, a.Placename)}
                                                title="Remove from Wishlist"
                                                style={{ width: '36px', height: '36px' }}
                                            >
                                                <FaTrash />
                                            </button>
                                            <span className="badge bg-dark bg-opacity-75 text-white position-absolute bottom-0 start-0 m-3 px-2 py-1 rounded-pill small">
                                                {a.Type || "Workspace"}
                                            </span>
                                        </div>
                                        <div className="wishlist-body card-body p-4 d-flex flex-column justify-content-between">
                                            <div>
                                                <h3 className="h5 fw-bold mb-1">{a.Placename}</h3>
                                                {(a.City || a.Address) && (
                                                    <p className="text-muted small d-flex align-items-center gap-1 mb-3">
                                                        <FaMapMarkerAlt className="text-danger flex-shrink-0" />
                                                        <span className="text-truncate">{a.Address ? `${a.Address}, ${a.City || ''}` : a.City}</span>
                                                    </p>
                                                )}
                                                <p className="text-muted small mb-3">Saved to your favorites for quick booking and menu access.</p>
                                            </div>
                                            <div className="d-flex gap-2 mt-auto pt-2">
                                                <Link to={`/view?id=${placeId}`} className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-2">
                                                    <span>View Details</span> <FaExternalLinkAlt style={{ fontSize: '0.8rem' }} />
                                                </Link>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeFromWishlist(a._id, a.Placename)}
                                                    title="Remove"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};
