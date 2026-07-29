import { useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate, useParams } from "react-router-dom";
import { Rating } from "react-simple-star-rating";
import AOS from "aos";
import { Context } from "./usecontext";
import { showError, showInfo, showSuccess } from "./alerts";

export const PlaceView = () => {
    const [img, setimg] = useState();
    const [name, setname] = useState("");
    const [img2, setimg2] = useState("");
    const [img3, setimg3] = useState("");
    const [img4, setimg4] = useState("");
    const [address, setaddress] = useState("")
    const [type, settype] = useState("")
    const [meeting, setMeeting] = useState("");
    const [about, setAbout] = useState();
    const [gaming, setGaming] = useState("");
    const [wifi, setwifi] = useState("");
    const [rating, setRating] = useState("");
    const [rating2, setRating2] = useState("");
    const [showreview, setshowreview] = useState([]);
    const [user, setuser] = useState("");
    const [usermail, setusermail] = useState("");
    const[city,setcity]=useState("")
    const [msg, setmsg] = useState("");
    const { id } = useContext(Context)
    const [pr] = useSearchParams();
    const navigate=useNavigate()
    const params = useParams();
    const prr = pr.get("id") || params.id;

    const show = useCallback(async () => {
        const result = await fetch(`http://localhost:9000/api/showplace2/${prr}`);

        const res = await result.json();

        if (res.statuscode === 1) {
            setname(res.data.Placename);
            setimg(res.data.Image[0]);
            setimg2(res.data.Image[1]);
            setimg3(res.data.Image[2]);
            setimg4(res.data.Image[3]);
            setAbout(res.data.About);
            setGaming(res.data.Gaming);
            setMeeting(res.data.Meeting);
            setcity(res.data.City)
            setwifi(res.data.WiFi);
            setRating(res.data.Rating);
            setaddress(res.data.Address)
            settype(res.data.Type)
        }
    }, [prr]);

    const show2 = useCallback(async () => {
        const result = await fetch(`http://localhost:9000/api/getreview/${prr}`);

        const res = await result.json();

        if (res.statuscode === 1) {
            setshowreview(res.data);
        }
    }, [prr]);

    useEffect(() => {
        if (prr) {
            if (!id) {
                showInfo("Login Recommended", "Login to add places to your wishlist.")
            }
            show();
            show2();
        }
    }, [id, prr, show, show2]);

    useEffect(() => {
        AOS.refresh();
    }, [name, showreview]);

    const handleRating = (rate) => {
        setRating2(rate);
    };

    const send = async (e) => {
        e.preventDefault();

        const result = await fetch("http://localhost:9000/api/review", {
            method: "post",
            body: JSON.stringify({
                user,
                usermail,
                rating2,
                msg,
                prr,
                id
            }),
            headers: {
                "Content-type": "application/json;charset=UTF-8"
            }
        });

        const res = await result.json();

        if (res.statuscode === 1) {
            showSuccess("Review Submitted", "Thanks for sharing your experience.");
            show2();
            setuser("");
            setusermail("");
            setmsg("");
        }
    };

    const handleFavorite=async()=>{
        const result=await fetch("http://localhost:9000/api/wishlist",{
            method:"post",
            body:JSON.stringify({id,prr,name,img,type,address,city}),
            headers:{"Content-type":"application/json;charset=UTF-8"}
        })
        if(result){
            const res=await result.json();
            if(res.statuscode===1){
                showSuccess("Added to Wishlist", "This place is now saved in your wishlist.")
                navigate(`/wish?id=${id}`)
            }
            else{
                showError("Wishlist Failed", "Please login or try again.")
            }
        }
    }

    return (
        <>
            <div className="container py-5 place-detail">
                <div className="row g-4 g-lg-5 align-items-start">
                    {/* LEFT SIDE */}
                    <div className="col-lg-6" data-aos="fade-right">
                        <img
                            src={img}
                            alt="main"
                            className="img-fluid main-img"
                        />
                        <div className="row g-3 mt-2">
                            {[img2, img3, img4].map((item, index) => (
                                <div className="col-4" key={index}>
                                    <img
                                        src={item}
                                        alt="gallery"
                                        className="img-fluid sub-img"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* RIGHT SIDE */}
                    <div className="col-lg-6" data-aos="fade-left">
                        <p className="section-kicker">Place details</p>
                        <h1 className="fw-bold detail-title">{name}</h1>
                        <div className="my-3">
                            <Rating
                                initialValue={parseFloat(rating)}
                                allowFraction
                                readonly
                                size={28}
                            />
                        </div>
                        <p className="about-text">
                            {about}
                        </p>
                        <div className="d-flex flex-wrap gap-3 mt-4">
                            <span className={`feature-badge ${gaming ? "active-feature" : "inactive-feature"}`}>
                                Gaming {gaming ? "Allowed" : "Not Allowed"}
                            </span>
                            <span className={`feature-badge ${meeting ? "active-feature" : "inactive-feature"}`}>
                                Meetings {meeting ? "Allowed" : "Not Allowed"}
                            </span>
                            <span className={`feature-badge ${wifi ? "active-feature" : "inactive-feature"}`}>
                                WiFi {wifi ? "Available" : "Unavailable"}
                            </span>
                        </div>
                        <p className="mt-3 detail-address"><span className="fw-semibold">Address: </span>{address}</p>
                        <div className="d-flex align-items-center gap-3 mt-4">
                            {(() => {
                                if (type === "6a0494a3da7b49bca4d98cf0") {
                                    return (
                                        <Link to="/reserve">
                                            <button className="btn btn-primary px-4">Book A Table</button>
                                        </Link>
                                    );
                                } else if (type === "6a058fe9c534f199eb62f2c9") {
                                    return (
                                        <Link to="/cowork">
                                            <button className="btn btn-primary px-4">Book A Space</button>
                                        </Link>
                                    );
                                } else {
                                    return (
                                        <Link to="/bookroom">
                                            <button className="btn btn-primary px-4">Book Room</button>
                                        </Link>
                                    );
                                }
                            })()}
                            <span className=""><button className="btn" onClick={handleFavorite}><i className="fa-sharp-duotone fa-solid fa-heart"></i></button></span>
                        </div>

                    </div>
                </div>
                {/* REVIEW SECTION */}
                <div className="row mt-5 g-5">
                    {/* FORM */}
                    <div className="col-lg-5" data-aos="fade-up">
                        <div className="review-form shadow-lg">
                            <h3 className="fw-bold mb-4">
                                Write a Review
                            </h3>
                            <form onSubmit={send}>
                                <input
                                    className="form-control custom-input"
                                    type="text"
                                    placeholder="Your Name"
                                    value={user}
                                    onChange={(e) => setuser(e.target.value)}
                                />
                                <input
                                    className="form-control custom-input mt-3"
                                    type="email"
                                    placeholder="Your Email"
                                    value={usermail}
                                    onChange={(e) => setusermail(e.target.value)}
                                />
                                <textarea
                                    className="form-control custom-input mt-3"
                                    rows="5"
                                    placeholder="Write your review..."
                                    value={msg}
                                    onChange={(e) => setmsg(e.target.value)}
                                ></textarea>
                                <div className="mt-4">
                                    <h6 className="fw-semibold mb-2">
                                        Give Rating
                                    </h6>
                                    <Rating
                                        onClick={handleRating}
                                        allowFraction
                                    />
                                </div>
                                <button
                                    className="btn btn-dark px-4 py-2 mt-4"
                                    type="submit"
                                >
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    </div>
                    {/* REVIEWS */}
                    {
                        showreview.length > 0 ? (
                            <div className="col-lg-7" data-aos="fade-up" data-aos-delay="120">
                                <h2 className="fw-bold mb-4">
                                    Customer Reviews
                                </h2>
                                {
                                    showreview.map((a, index) => (
                                        <div
                                            key={index}
                                            className="review-card"
                                            data-aos="fade-up"
                                            data-aos-delay={(index % 3) * 80}
                                        >

                                            <div className="d-flex flex-column flex-sm-row align-items-sm-start justify-content-between gap-3">
                                                {/* LEFT SIDE */}
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar me-3">
                                                        {a.Name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-1 fw-bold">
                                                            {a.Name}
                                                        </h6>
                                                        <Rating
                                                            initialValue={parseFloat(a.Rating)}
                                                            allowFraction
                                                            readonly
                                                            size={20}
                                                        />
                                                    </div>
                                                </div>
                                                {/* DATE */}
                                                <small className="text-muted">
                                                    {a.Date.split("T")[0]}
                                                </small>
                                            </div>


                                            <div>
                                                <p className="review-msg mt-3">
                                                    {a.Msg}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                        ) : (
                            <div className="text-left col py-5  h-50 rounded">
                                <h1>Customer Reviews</h1>
                                <h5 className="mt-5" >No Reviews Yet</h5>
                                <p className="text-muted">
                                    Be the first to review this product!
                                </p>
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    );
};
