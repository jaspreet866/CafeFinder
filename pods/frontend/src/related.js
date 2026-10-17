import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Rating } from "react-simple-star-rating"
import { Link } from "react-router-dom"
import { showInfo } from "./alerts"
import { getApiUrl } from "./apiConfig"

export const Related = () => {

    const [d, setd] = useState([])
    const [filterbycity, setfilterbycity] = useState("")
    const [filterbyrating, setfiltebyrating] = useState("")
    const [filterbyamenity, setfilterbyamenity] = useState("")
    const [prr] = useSearchParams()
    const pr = prr.get("id")


    useEffect(() => {
        const show = async () => {
            try {
                const result = await fetch(getApiUrl(`/api/related/${pr}`), {
                    method: "get"
                })
            if (result) {
                const res = await result.json()
                if (res.statuscode === 1) {
                    setd(res.data)
                }
                else {
                    showInfo("No Matching Places", "Try another category or check again later.")
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    show()
    }, [pr])
    const clearFilters = () => {
        setfilterbycity("")
        setfiltebyrating("")
        setfilterbyamenity("")
    }

    const filter = d
        .filter((a) => {
            if (filterbycity === "") {
                return true
            }
            return a.City && a.City.toLowerCase() === filterbycity.toLowerCase()
        })
        .filter((a) => {
            if (filterbyrating === "") {
                return true
            }
            return parseFloat(a.Rating || 0) >= Number(filterbyrating)
        })
        .filter((a) => {
            if (filterbyamenity === "") {
                return true
            }
            const key = filterbyamenity.toLowerCase();
            return a[filterbyamenity] === true || a[filterbyamenity] === "true" ||
                   a[key] === true || a[key] === "true";
        })
        .sort((a, b) => parseFloat(b.Rating || 0) - parseFloat(a.Rating || 0))

    const filterControls = (
        <div className="row g-3 align-items-end">
            <div className="col-md-3 col-sm-6">
                <label className="form-label">City</label>
                <select className="form-select" value={filterbycity} onChange={(e) => setfilterbycity(e.target.value)}>
                    <option value="">All cities</option>
                    <option value="mohali">Mohali</option>
                    <option value="ludhiana">Ludhiana</option>
                    <option value="patiala">Patiala</option>
                    <option value="chandigarh">Chandigarh</option>
                    <option value="hoshiarpur">Hoshiarpur</option>
                    <option value="jalandhar">Jalandhar</option>
                    <option value="panchkula">Panchkula</option>
                </select>
            </div>

            <div className="col-md-3 col-sm-6">
                <label className="form-label">Rating</label>
                <select className="form-select" value={filterbyrating} onChange={(e) => setfiltebyrating(e.target.value)}>
                    <option value="">Any rating</option>
                    <option value="4">4 stars and above</option>
                    <option value="3">3 stars and above</option>
                </select>
            </div>

            <div className="col-md-4">
                <label className="form-label">Amenities</label>
                <select className="form-select" value={filterbyamenity} onChange={(e) => setfilterbyamenity(e.target.value)}>
                    <option value="">Any amenity</option>
                    <option value="WiFi">WiFi</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Meeting">Meeting</option>
                </select>
            </div>

            <div className="col-md-2 d-flex flex-column gap-2">
                <button className="btn btn-outline-primary w-100" type="button" onClick={clearFilters}>
                    Clear
                </button>
            </div>
        </div>
    )

    return (
        <>
            <section className="content-section">
                <div className="container">
                    <div className="section-heading">
                        <p className="section-kicker">Matching places</p>
                        <h1>Find By Choice</h1>
                    </div>

                    <div className="related-mobile-filter mb-4 d-md-none">
                        <button
                            className="btn btn-primary w-100"
                            type="button"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#relatedFilterCanvas"
                            aria-controls="relatedFilterCanvas"
                        >
                            Open Filters
                        </button>
                    </div>

                    <div
                        className="offcanvas offcanvas-bottom related-filter-offcanvas d-md-none"
                        tabIndex="-1"
                        id="relatedFilterCanvas"
                        aria-labelledby="relatedFilterCanvasLabel"
                    >
                        <div className="offcanvas-header">
                            <div>
                                <p className="section-kicker mb-1">Filters</p>
                                <h2 className="offcanvas-title" id="relatedFilterCanvasLabel">Refine Results</h2>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div className="offcanvas-body">
                            {filterControls}
                        </div>
                    </div>

                    <div className="related-filter-panel mb-4 d-none d-md-block">
                        <div>
                            <p className="section-kicker mb-1">Filters</p>
                            <h2>Refine Results</h2>
                        </div>
                        {filterControls}
                    </div>

                    {filter.length === 0 ? (
                        <div className="text-center py-5">
                            <h3 className="h4 text-muted mb-2">No matching places found</h3>
                            <p className="text-muted mb-3">Try adjusting your filters or clear them to view all results.</p>
                            <button className="btn btn-outline-primary" onClick={clearFilters}>Reset Filters</button>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {filter.map((a) => {
                                const placeImg = Array.isArray(a.Image) && a.Image.length > 0 
                                    ? a.Image[0] 
                                    : (typeof a.Image === "string" && a.Image ? a.Image : "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800");
                                const mapUrl = a.Location && a.Location.lat && a.Location.lng 
                                    ? `https://www.google.com/maps?q=${a.Location.lat},${a.Location.lng}`
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.Placename} ${a.City || ''}`)}`;

                                return (
                                    <div className="col-12 col-sm-6 col-lg-4" key={a._id}>
                                        <article className="place-card h-100">
                                            <img src={placeImg} className="place-card-img" alt={a.Placename} />
                                            <div className="place-card-body">
                                                <div className="mb-2">
                                                    <Rating
                                                        initialValue={parseFloat(a.Rating) || 0}
                                                        allowFraction
                                                        readonly
                                                        size={20}
                                                    />
                                                </div>
                                                <h3 className="place-card-title">{a.Placename}</h3>
                                                <p className="text-muted mb-2">{a.City}</p>
                                                <p className="title">{a.Address}</p>
                                                <div className="d-flex flex-row gap-2 mt-3">
                                                    <a
                                                        href={mapUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-outline-primary btn-sm flex-fill"
                                                    >
                                                        View on Map
                                                    </a>
                                                    <Link
                                                        to={`/view?id=${a._id}`}
                                                        className="btn btn-primary btn-sm flex-fill"
                                                    >
                                                        See Location
                                                    </Link>
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
        </>
    )
}
