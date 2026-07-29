import { useEffect, useState } from "react";
import { showError } from "./alerts";

export const Admin = () => {

    const [users, setusers] = useState("")
    const [place, setplace] = useState("")
    const [reserve, setreserve] = useState("")
    const [alllplaces, setallplaces] = useState([])
    const [allcat, setallcats] = useState([])
    const [review, setreview] = useState("")
    const [allusers, setallusers] = useState([])
    const [reviews, setreviews] = useState([])

    useEffect(() => {
        show()
        show2()
        show3()
        show4()
        show5()
    }, [])

    const show = async () => {
        const result = await fetch("http://localhost:9000/api/getusers", {
            method: "get"
        })
        if (result) {
            const res = await result.json()
            if (res.statuscode === 1) {
                setusers(res.data.length)
                setallusers(res.data)
            }
        }
    }
    const show2 = async () => {
        const result = await fetch("http://localhost:9000/api/showplace", {
            method: "get"
        })
        if (result) {
            const res = await result.json()
            if (res.statuscode === 1) {
                setplace(res.data.length)
                setallplaces(res.data)
            }
        }
    }
    const show3 = async () => {
        const result = await fetch("http://localhost:9000/api/reservations", {
            method: "get",
        })
        if (result) {
            const res = await result.json()
            if (res.statuscode === 1) {
                setreserve(res.data.length)
            }
        }
    }
    const show4 = async () => {
        const result = await fetch("http://localhost:9000/api/allreviews", {
            method: "get"
        })
        if (result) {
            const res = await result.json()
            if (res.statuscode === 1) {
                setreview(res.data.length)
                setreviews(res.data)

            }
        }
    }
    const show5 = async () => {
        const result = await fetch("http://localhost:9000/api/getcat", {
            method: "get",
        })
        if (result) {
            const res = await result.json()
            if (res.statuscode === 1) {
                setallcats(res.data)
            }
            else {
                showError("Categories Not Loaded", "Please refresh the admin panel and try again.")
            }
        }
    }
    const removeuser=async(id)=>{
        const result=await fetch(`http://localhost:9000/api/removeuser/${id}`,{
            method:"delete"
        })
        if(result.ok){
            const res=await result.json()
            if(res.statuscode===1){
                alert("deleted")
                show()
            }
            else{
                alert("not")
            }
        }
    }

    const removeplace=async(id)=>{
        const result=await fetch(`http://localhost:9000/api/removeplace/${id}`,{
            method:"delete"
        })
        if(result.ok){
            const res=await result.json()
            if(res.statuscode===1){
                alert("deleted")
                show2()
            }
            else{
                alert("not now")
            }
        }
    }


    return (
        <main className="admin-page">
            <div className="container">
                <div className="admin-layout">
                    <aside className="admin-sidebar">
                        <div className="admin-brand-mark">W</div>
                        <p className="section-kicker">Admin Panel</p>
                        <h2>WorkWave Admin</h2>
                        <p className="admin-sidebar-copy">Monitor activity and keep the workspace directory clean.</p>

                        <nav className="admin-menu">
                            <a href="#dashboard"><span>01</span> Dashboard</a>
                            <a href="#places"><span>02</span> Places</a>
                            <a href="#categories"><span>03</span> Categories</a>
                            <a href="#users"><span>04</span> Users</a>
                            <a href="#reviews"><span>05</span> Reviews</a>
                        </nav>
                    </aside>

                    <section className="admin-content">
                        <section className="admin-hero" id="dashboard">
                            <div>
                                <p className="section-kicker">Dashboard</p>
                                <h1>Admin Dashboard</h1>
                                <p>Overview of users, places, reservations, reviews, and website activity.</p>
                            </div>
                            <div className="admin-hero-panel">
                                <span>Live</span>
                                <strong>{users || 0}</strong>
                                <small>registered users</small>
                            </div>
                        </section>

                        <div className="admin-stats">
                            <div className="admin-stat-card admin-stat-users card">
                                <div className="card-body">
                                    <span className="admin-stat-icon">U</span>
                                    <h3>Total Users</h3>
                                    <h1>{users}</h1>
                                </div>
                            </div>
                            <div className="admin-stat-card admin-stat-places card">
                                <div className="card-body">
                                    <span className="admin-stat-icon">P</span>
                                    <h3>Total Places</h3>
                                    <p>{place}</p>
                                </div>
                            </div>
                            <div className="admin-stat-card admin-stat-reserve card">
                                <div className="card-body">
                                    <span className="admin-stat-icon">R</span>
                                    <h3>Reservations</h3>
                                    <p>{reserve}</p>
                                </div>
                            </div>
                            <div className="admin-stat-card admin-stat-reviews card">
                                <div className="card-body">
                                    <span className="admin-stat-icon">F</span>
                                    <h3>Total Reviews</h3>
                                    <p>{review}</p>
                                </div>
                            </div>
                        </div>

                        <section className="admin-section" id="places">
                            <AdminSection title="Manage Places">
                                <div className="table-responsive admin-table-wrap">
                                    <table className="table table-hover align-middle admin-bootstrap-table mb-0">
                                        <thead>
                                            <tr>
                                                <th scope="col">Place Name</th>
                                                <th scope="col">Address</th>
                                                <th scope="col">City</th>
                                                <th scope="col" className="text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                alllplaces.map((a) =>
                                                    <tr key={a._id || a.Placename}>
                                                        <td className="admin-place-name">{a.Placename}</td>
                                                        <td className="admin-address-cell">{a.Address}</td>
                                                        <td><span className="admin-status admin-status-visible">{a.City}</span></td>
                                                        <td className="text-end"><button className="btn btn-outline-danger btn-sm" onClick={()=>removeplace(a._id)}>Remove</button></td>
                                                    </tr>)
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </AdminSection>
                        </section>

                        <section className="admin-section" id="categories">
                            <AdminSection title="Manage Categories">
                                <div className="row g-3">
                                    {
                                        allcat.map((a) =>
                                            <div className="col-12 col-md-6 col-xl-4" key={a._id || a.Type}>
                                                <div className="admin-category-card">
                                                    <span>{a.Type}</span>
                                                    <button className="btn btn-outline-danger btn-sm">Remove</button>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </AdminSection>
                        </section>

                        <section className="admin-section" id="users">
                            <AdminSection title="Manage Users">
                                <div className="table-responsive admin-table-wrap">
                                    <table className="table table-hover align-middle admin-bootstrap-table mb-0">
                                        <thead>
                                            <tr>
                                                <th scope="col">Name</th>
                                                <th scope="col">Email</th>
                                                <th scope="col">UserID</th>
                                                <th scope="col">UserType</th>
                                                <th scope="col" className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                allusers.map((a) =>
                                                    <tr key={a._id}>
                                                        <td>
                                                            <div className="admin-user-cell">
                                                                <span>{a.Name ? a.Name.charAt(0) : "U"}</span>
                                                                <strong>{a.Name}</strong>
                                                            </div>
                                                        </td>
                                                        <td>{a.Email}</td>
                                                        <td className="admin-id-cell">{a._id}</td>
                                                        <td>
                                                            <span className="badge rounded-pill text-bg-primary">{a.UserType}</span>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-end gap-2 flex-wrap">
                                                                <button className="btn btn-outline-primary btn-sm" type="button">Change Type</button>
                                                                <button className="btn btn-outline-danger btn-sm" type="button" onClick={()=>removeuser(a._id)}>Delete User</button>
                                                            </div>
                                                        </td>
                                                    </tr>)
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </AdminSection>
                        </section>

                        <section className="admin-section" id="reviews">
                            <AdminSection title="Reviews And Feedback">
                                <div className="row g-3">
                                    {
                                        reviews.map((a) =>
                                            <div className="col-12 col-xl-6" key={a._id || `${a.Email}-${a.UserID}`}>
                                                <div className="card admin-review-card h-100 border-0">
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between gap-3 mb-3">
                                                            <div>
                                                                <h3 className="h6 mb-1">{a.Name}</h3>
                                                                <p className="small mb-0">{a.Email}</p>
                                                            </div>
                                                            <span className="badge rounded-pill text-bg-warning">Review</span>
                                                        </div>
                                                        <p className="admin-review-message mb-3">{a.Msg}</p>
                                                        <p className="small mb-0">UserID: {a.UserID}</p>
                                                    </div>
                                                </div>
                                            </div>)
                                    }
                                </div>
                            </AdminSection>
                        </section>
                    </section>
                </div>
            </div>
        </main>
    );
};

const AdminSection = ({ title, children }) => {
    return (
        <>
            <div className="admin-section-head">
                <div>
                    <p className="section-kicker mb-1">Control Center</p>
                    <h2>{title}</h2>
                </div>
            </div>
            <div className="admin-section-body">
                {children}
            </div>
        </>
    );
};
