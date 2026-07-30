import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Rating } from "react-simple-star-rating"
import AOS from "aos"
import { showInfo } from "./alerts"

const useTypewriter = (words, speed = 120, delay = 1500) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);

    useEffect(() => {
        if (subIndex === words[index].length + 1 && !reverse) {
            const timeout = setTimeout(() => setReverse(true), delay);
            return () => clearTimeout(timeout);
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, speed + (reverse ? -60 : 0));

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words, speed, delay]);

    return words[index].substring(0, subIndex);
};

export const Main = () => {
    const typedText = useTypewriter(["Work", "Meetings", "Breaks", "Focus"], 120, 1500);
    const [data, setd] = useState([])
    const [d3, setd3] = useState([])
    const [d4, setd4] = useState([])
    const carouselRef = useRef(null)

    useEffect(() => {
        show()
        show3()
        show4()
    }, [])

    useEffect(() => {
        if (window.bootstrap && carouselRef.current) {
            const carousel = window.bootstrap.Carousel.getOrCreateInstance(carouselRef.current, {
                interval: 3000,
                ride: "carousel"
            })

            carousel.cycle()
        }
    }, [])

    useEffect(() => {
        AOS.refresh()
    }, [data, d3, d4])


    const show = async () => {
        const result = await fetch("https://cafefinder-u2me.onrender.com/api/showplace", {
            method: "get"
        })
        if (result) {
            const res = await result.json()
            if (res.statuscode === 1) {
                setd(res.data)
            }
            else {
                showInfo("No Places Found", "Please check again after places are added.")
            }
        }
    }

    const show3 = async () => {
        const result = await fetch("https://cafefinder-u2me.onrender.com/api/gamingandcafe", {
            method: "get"
        })
        if (result) {
            const res = await result.json()
            if (res.statuscode === 1) {
                setd3(res.data)
            }
            else {
                showInfo("No Gaming Cafes Found", "Please check again later.")
            }
        }
    }

    const show4 = async () => {
        const result = await fetch("https://cafefinder-u2me.onrender.com/api/getcat", {
            method: "get"
        })
        if (result) {
            const res = await result.json()
            if (res.statuscode === 1) {
                setd4(res.data)
            }
            else {
                showInfo("No Categories Found", "Categories will appear here once they are added.")
            }
        }
    }
    const renderPlaceCard = (a, index) => (
        <div className="col-12 col-sm-6 col-lg-4" key={a._id} data-aos="fade-up" data-aos-delay={(index % 3) * 90}>
            <article className="place-card h-100">
                <img src={a.Image[0]} className="place-card-img" alt={a.Placename} />
                <div className="place-card-body">
                    <div className="mb-2">
                        <Rating
                            initialValue={parseFloat(a.Rating)}
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
                            href={`https://www.google.com/maps?q=${a.Location.lat},${a.Location.lng}`}
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

    const experienceHighlights = [
        {
            title: "Cafe Workspaces",
            text: "Settle into comfortable cafes with WiFi, ratings, locations, and table booking details in one place.",
            value: data.length,
            label: "Places listed"
        },
        {
            title: "Gaming Cafes",
            text: "Find cafes that support focused work and a quick gaming break when the day needs more energy.",
            value: d3.length,
            label: "Gaming picks"
        },
        {
            title: "Easy Discovery",
            text: "Browse by category, compare addresses, and open directions before you choose where to go.",
            value: d4.length,
            label: "Categories"
        }
    ]

    const steps = [
        {
            title: "Choose your vibe",
            text: "Start with categories that match the plan, from cafes to meeting-friendly rooms."
        },
        {
            title: "Check the details",
            text: "Review photos, ratings, address, WiFi, gaming, and meeting options before visiting."
        },
        {
            title: "Book or navigate",
            text: "Reserve a table, book a room, or open the exact map location in a tap."
        }
    ]

    return (<>
        <section className="hero-section" data-aos="fade-in">
            <div className="hero-bg-glow-1"></div>
            <div className="hero-bg-glow-2"></div>
            
            <div className="container position-relative z-2">
                <div className="row g-5 align-items-center">
                    <div className="col-lg-6" data-aos="fade-right">
                        <span className="badge bg-primary-soft text-primary px-3 py-2 rounded-pill mb-3 fw-bold">
                            ✨ Work from anywhere, seamlessly
                        </span>
                        <h1 className="hero-title mb-3">
                            Find a better place for <br />
                            <span className="text-gradient">{typedText}</span>
                            <span className="typewriter-cursor">|</span>
                        </h1>
                        <p className="hero-subtitle mb-4">
                            WorkWave helps you discover premium cafes, high-speed coworking desks, and meeting rooms that fit your lifestyle. Calm seating, verified WiFi, and table bookings are just a tap away.
                        </p>
                        <div className="d-flex flex-column flex-sm-row gap-3">
                            <a href="#popular-cafes" className="btn btn-primary px-4 py-3 shadow">
                                Explore Cafes
                            </a>
                            <a href="#categories" className="btn btn-outline-primary px-4 py-3">
                                Browse Categories
                            </a>
                        </div>
                    </div>
                    
                    <div className="col-lg-6" data-aos="fade-left">
                        <div className="hero-dashboard-preview">
                            <div className="preview-header">
                                <div className="preview-dots">
                                    <span></span><span></span><span></span>
                                </div>
                                <div className="preview-search-bar">workwave.com/explore</div>
                            </div>
                            <div className="preview-body position-relative">
                                <div ref={carouselRef} id="heroPreviewCarousel" className="carousel slide" data-bs-ride="carousel">
                                    <div className="carousel-inner">
                                        <div className="carousel-item active">
                                            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" className="d-block w-100" alt="Workspace 1" />
                                            <div className="glass-card position-absolute bottom-0 start-0 m-3 p-3 text-start d-none d-md-block">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="dot dot-success"></span>
                                                    <strong className="text-white">Active Coworking</strong>
                                                </div>
                                                <small className="text-white-50">Ergonomic desks & dual monitors</small>
                                            </div>
                                        </div>
                                        <div className="carousel-item">
                                            <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80" className="d-block w-100" alt="Workspace 2" />
                                            <div className="glass-card position-absolute bottom-0 start-0 m-3 p-3 text-start d-none d-md-block">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="dot dot-success"></span>
                                                    <strong className="text-white">Private Study Pods</strong>
                                                </div>
                                                <small className="text-white-50">Sound-isolated for focus blocks</small>
                                            </div>
                                        </div>
                                        <div className="carousel-item">
                                            <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80" className="d-block w-100" alt="Workspace 3" />
                                            <div className="glass-card position-absolute bottom-0 start-0 m-3 p-3 text-start d-none d-md-block">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="dot dot-success"></span>
                                                    <strong className="text-white">Workspace Cafes</strong>
                                                </div>
                                                <small className="text-white-50">Aesthetic rooms with cozy lighting</small>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="carousel-control-prev" type="button" data-bs-target="#heroPreviewCarousel" data-bs-slide="prev">
                                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span className="visually-hidden">Previous</span>
                                    </button>
                                    <button className="carousel-control-next" type="button" data-bs-target="#heroPreviewCarousel" data-bs-slide="next">
                                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span className="visually-hidden">Next</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="content-section py-5">
            <div className="container">
                <div className="row g-4 justify-content-center">
                    {experienceHighlights.map((item, index) => (
                        <div className="col-lg-4 col-md-6" key={item.title} data-aos="fade-up" data-aos-delay={index * 90}>
                            <article className="highlight-card h-100">
                                <div className="highlight-value">{item.value}</div>
                                <p className="highlight-label">{item.label}</p>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                            </article>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section className="content-section section-muted" id="categories">
            <div className="container">
                <div className="section-heading" data-aos="fade-up">
                    <p className="section-kicker">Browse categories</p>
                    <h1>Find by Choice</h1>
                </div>
                <div className="row g-4">
                    {
                        d4.map((a, index) =>
                            <div className=" col-sm-6 col-6 col-lg-4" key={a._id} data-aos="zoom-in-up" data-aos-delay={(index % 3) * 90}>
                                <Link className="category-card" to={`/category?id=${a._id}`}>
                                    <img src={a.Img} alt={a.Type} />
                                    <h3>{a.Type}</h3>
                                </Link>
                            </div>
                        )
                    }
                </div>

            </div>
        </section>

        <section className="content-section" id="popular-cafes">
            <div className="container">
                <div className="section-heading" data-aos="fade-up">
                    <p className="section-kicker">Popular places</p>
                    <h1>Newly Added Places</h1>
                </div>
                <div className="row g-4">
                    {data.map(renderPlaceCard)}
                </div>
            </div>
        </section>

        <section className="content-section section-muted process-section">
            <div className="container">
                <div className="section-heading" data-aos="fade-up">
                    <p className="section-kicker">How it works</p>
                    <h1>Plan your visit in minutes</h1>
                </div>
                <div className="row g-4">
                    {steps.map((item, index) => (
                        <div className="col-md-4 col-6" key={item.title} data-aos="fade-up" data-aos-delay={index * 90}>
                            <article className="step-card h-100">
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                            </article>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section className="content-section booking-cta-section">
            <div className="container">
                <div className="booking-cta" data-aos="fade-up">
                    <div className="mb-4 content2">
                        <p className="section-kicker">Ready when you are</p>
                        <h1>Book the right space for your next plan.</h1>
                        <p>
                            Choose a cozy table for coffee and work, or reserve a room when your group needs privacy and focus.
                        </p>
                    </div>
                    <div className="d-flex flex-column flex-sm-row gap-2">
                        <Link to="/reserve" className="btn btn-primary px-4">
                            Book A Table
                        </Link>
                        <Link to="/bookroom" className="btn btn-outline-primary px-4">
                            Book Room
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    </>)
}
