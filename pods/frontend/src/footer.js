export const Footer = () => {




    return (
        <>
            <footer className="site-footer mt-5 pt-5">
                <div className="container">
                  
                    <div className="row gy-4">

                    
                        <div className="col-lg-3 col-6 col-md-6">
                           <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">
                                <defs>
                                    <linearGradient id="waveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#e8ecf2ff" />
                                        <stop offset="100%" stopColor="#eff3f4ff" />
                                    </linearGradient>
                                </defs>
                                <path d="M15,65 Q30,25 45,55 T75,35 T90,20" fill="none" stroke="url(#waveGradient)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M25,75 Q40,40 55,65 T85,45" fill="none" stroke="#e8edf3ff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                            </svg>
                            <span className="logo-text">Work<span className="logo-accent">Wave</span></span>
                        </div>

                        {/* PRODUCTS */}
                        <div className="col-lg-3 col-6 col-md-6">
                            <h5 className="fw-semibold mb-3">Services</h5>
                            <ul className="list-unstyled text-muted">
                                <li>Hotels</li>
                                <li>Cafes</li>
                                <li>Co-working Spaces</li>
                            </ul>
                        </div>

                        {/* FEATURES */}
                        <div className="col-lg-3 col-6 col-md-6">
                            <h5 className="fw-semibold mb-3">Features</h5>
                            <ul className="list-unstyled text-muted">
                                <li>About Us</li>
                                <li>Contact Us</li>
                                <li>Order</li>
                                <li>Terms & Conditions</li>
                            </ul>
                        </div>

                        {/* HELP */}
                        <div className="col-lg-3 col-6 col-md-6">
                            <h5 className="fw-semibold mb-2">
                                We are here to help you
                            </h5>
                            <p className="text-muted">
                                If any problem, email us
                            </p>

                            <input
                                type="email"
                                className="form-control mb-2"
                                placeholder="Your email"
                            />
                            <button className="btn btn-primary w-100">
                                Send
                            </button>
                        </div>
                    </div>

                    <hr className="my-4" />

                    <div className="row align-items-center gy-3">

                        
                        <div className="col-md-4 text-center text-md-start">
                            <p className="mb-0 text-muted">
                                &copy; WorkWave 2026. All Rights Reserved
                            </p>
                        </div>

                       
                        <div className="col-md-4 text-center">
                            <div className="d-flex justify-content-center gap-3 fs-5">
                                <i className="fa-brands fa-facebook"></i>
                                <i className="fa-brands fa-instagram"></i>
                                <i className="fa-brands fa-x-twitter"></i>
                            </div>
                        </div>

                    
                        <div className="col-md-4 text-center text-md-end">
                            <div className="d-flex justify-content-center justify-content-md-end gap-2">
                              
                            </div>
                        </div>

                    </div>
                </div>
            </footer>
        </>
    )
}
