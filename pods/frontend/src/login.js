import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { showError, showSuccess } from "./alerts"

export const Login=()=>{

    const [email,setemail]=useState("")
    const[pass,setpass]=useState("")
    const navigate=useNavigate()


    
  const login=async(e)=>{
    e.preventDefault()
    const result=await fetch("http://localhost:9000/api/login",{
        method:"post",
        body:JSON.stringify({email,pass}),
        headers:{"Content-type":"application/json;charset=UTF-8"}
    })
    if(result){
        const res=await result.json()
        if(res.statuscode===1){
             localStorage.setItem("data", JSON.stringify(res.jwtoken))
            showSuccess("Login Successful", "Welcome back to WorkWave.")
            navigate("/")
        }
        else{
            showError("Login Failed", "Please check your email and password.")
        }
    }
}

    return(
        <>
        <section className="auth-page">
            <div className="container ">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-5">
                        <form className="form-panel" onSubmit={login}>
                            <p className="section-kicker">Welcome back</p>
                            <h1 className="mb-4">Login</h1>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input className="form-control" type="email" placeholder="Enter email" onChange={(e)=>setemail(e.target.value)}></input>
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Password</label>
                                <input className="form-control" type="password" placeholder="Enter password" onChange={(e)=>setpass(e.target.value)}></input>
                            </div>
                            <button className="btn btn-primary w-100 py-2" type="submit">Login</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
        </>
    )

}
