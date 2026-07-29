import { useContext, useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "./usecontext";
import Swal from "sweetalert2";

export const Header = () => {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
    const { id,setid } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.toggle("dark-mode", darkMode);
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((current) => !current);
    };

    const closeMobileOffcanvas = () => {
        const offcanvasElement = document.getElementById("mobileOffcanvas");
        const offcanvas = offcanvasElement && window.bootstrap?.Offcanvas.getInstance(offcanvasElement);

        offcanvas?.hide();
    };

    const handleLogout = () => {
        localStorage.removeItem("data");
        setid("")
        Swal.fire({
            icon:"success",
            title:"Logout",
            text:"You Have Successfully Logout From Your Account"
        })
        navigate("/login")
    }
    return (
        <>
            <nav className="navbar navbar-expand-lg p-3 shadow-sm sticky-top">
                <div className="container header-shell">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="navbar-toggler d-lg-none"
                            type="button"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#mobileOffcanvas"
                            aria-controls="mobileOffcanvas"
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        <Link to="/" className="workwave-logo-container">
                            <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">
                                <defs>
                                    <linearGradient id="waveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#0052cc" />
                                        <stop offset="100%" stopColor="#00b8d9" />
                                    </linearGradient>
                                </defs>
                                <path d="M15,65 Q30,25 45,55 T75,35 T90,20" fill="none" stroke="url(#waveGradient)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M25,75 Q40,40 55,65 T85,45" fill="none" stroke="#0052cc" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                            </svg>
                            <span className="logo-text">Work<span className="logo-accent">Wave</span></span>
                        </Link>
                    </div>

                    <button
                        className="theme-toggle theme-toggle-compact d-lg-none ms-auto"
                        type="button"
                        onClick={toggleTheme}
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        title={darkMode ? "Light mode" : "Dark mode"}
                    >
                        <span className="theme-toggle-icon" aria-hidden="true">
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </span>
                    </button>

                    <div className="collapse navbar-collapse d-none d-lg-flex align-items-center" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-lg-2">
                            <li className="nav-item">
                                <Link to="/" className="nav-link active fw-semibold">
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item dropdown">
                                <button
                                    className="nav-link dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Services
                                </button>
                                <ul className="dropdown-menu shadow-sm">
                                    <li><Link className="dropdown-item" to="/cowork">Coworking Spaces</Link></li>
                                    <li><Link className="dropdown-item" to="/reserve">Reservations</Link></li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <button
                                    className="nav-link dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Account
                                </button>
                                <ul className="dropdown-menu shadow-sm dropdown-menu-end">
                                    <li><Link className="dropdown-item" to="/account">My Account</Link></li>
                                    <li><Link className="dropdown-item" to="/login">Login</Link></li>
                                    <li><Link className="dropdown-item" to="/register">Register</Link></li>
                                    <li><Link className="dropdown-item" to="/place">Add Place</Link></li>
                                </ul>
                            </li>
                            <li className="nav-item">
                               {
                                id ? <button className="nav-link active" onClick={handleLogout}>Logout</button>:<Link className="text-decoration-none" to="/login"> <button className=" nav-link active">Login</button></Link>
                               }
                            </li>

                        </ul>
                        <button
                            className="theme-toggle ms-lg-3"
                            type="button"
                            onClick={toggleTheme}
                            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                            title={darkMode ? "Light mode" : "Dark mode"}
                        >
                            <span className="theme-toggle-icon" aria-hidden="true">
                                {darkMode ? <FaSun /> : <FaMoon />}
                            </span>
                            <span className="theme-toggle-label">{darkMode ? "Light" : "Dark"}</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="offcanvas offcanvas-start" tabIndex="-1" id="mobileOffcanvas" aria-labelledby="mobileOffcanvasLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title fw-bold" id="mobileOffcanvasLabel">WorkWave</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <input className="form-control rounded-pill mb-4" type="text" placeholder="Search places..." />
                    <button
                        className="theme-toggle theme-toggle-mobile mb-3"
                        type="button"
                        onClick={toggleTheme}
                    >
                        <span className="theme-toggle-icon" aria-hidden="true">
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </span>
                        <span>{darkMode ? "Light mode" : "Dark mode"}</span>
                    </button>
                    <nav className="mobile-nav">
                        <Link to="/" className="mobile-nav-link" onClick={closeMobileOffcanvas}>Home</Link>
                        <Link to="/category" className="mobile-nav-link" onClick={closeMobileOffcanvas}>Explore</Link>
                        <Link to="/cowork" className="mobile-nav-link" onClick={closeMobileOffcanvas}>Coworking Spaces</Link>
                        <Link to="/reserve" className="mobile-nav-link" onClick={closeMobileOffcanvas}>Reservations</Link>
                        <Link to="/account" className="mobile-nav-link" onClick={closeMobileOffcanvas}>My Account</Link>
                        <Link to="/login" className="mobile-nav-link" onClick={closeMobileOffcanvas}>Login</Link>
                        <Link to="/register" className="mobile-nav-link" onClick={closeMobileOffcanvas}>Register</Link>
                        <Link to="/place" className="mobile-nav-link" onClick={closeMobileOffcanvas}>Add Place</Link>
                    </nav>
                </div>
            </div>
        </>
    );
};
