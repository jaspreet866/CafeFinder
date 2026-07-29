import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { showError, showSuccess } from "./alerts"
export const Register = () => {

    const [name, setname] = useState("")
    const [pass, setpass] = useState()
    const [email, setemail] = useState("")
    const navigate = useNavigate()

    const register = async (e) => {
        e.preventDefault()
        const data = { name, pass, email }
        const result = await fetch("http://localhost:9000/api/register", {
            method: "post",
            body: JSON.stringify(data),
            headers:{"Content-type":"application/json;charset=UTF-8"}
        })
        if(result){
            const res=await result.json()
            if(res.statuscode===1){
                showSuccess("Account Created", "You can now login to your WorkWave account.")
                setemail("")
                setname("")
                setpass("")
            }
            else{
                showError("Registration Failed", "Please try again with valid details.")
            }
        }
    }



    return (
        <>
            <section className="auth-page">
            <div className="container">

                <div className="row align-items-center g-5">


                    <div className="col-lg-6">
                        <form className="form-panel" onSubmit={register}>
                        <p className="section-kicker">Join WorkWave</p>
                        <h1 className="mb-4">Register</h1>

                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Name"
                                onChange={(e) => setname(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                onChange={(e) => setemail(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                onChange={(e) => setpass(e.target.value)}
                            />

                        </div>

                        <button
                            className="btn btn-primary w-100 py-2"
                            type="submit"
                        >
                            Register
                        </button>
                        </form>
                    </div>


                    <div className="col-lg-6  d-lg-flex align-items-center">
                        <div className="side-panel w-100">
                            <h2 className="fw-bold">Create Your Account</h2>

                            <p className="text-muted mt-3">
                                Register to save places, book reservations,
                                and keep your WorkWave visits organized.
                            </p>

                            <ul className="list-unstyled mt-4">
                                <li className="mb-2">Easy reservations</li>
                                <li className="mb-2">Saved places</li>
                                <li className="mb-2">Faster check-ins</li>
                            </ul>
                            <hr></hr>
                            <div><p className="text-primary">Already Have a Account?<br></br>Get Back to Your Account </p>
                                <button className="btn btn-primary " onClick={() => navigate("/login")}>Login</button></div>
                        </div>

                    </div>

                </div>
            </div>
            </section>
        </>
    )
}
