import { useState } from "react"
import { showError, showSuccess } from "./alerts"

export const Reserve = () => {

const[name,setname]=useState()
const[email,setemail]=useState()
const[guest,setguest]=useState()
const[date,setdate]=useState()
const [phone,setphone]=useState()



const reserve=async(e)=>{
    e.preventDefault()
    const result=await fetch("https://cafefinder-u2me.onrender.com/api/reservation",{
        method:"post",
        body:JSON.stringify({name,email,guest,date,phone}),
        headers:{"Content-type":"application/json;charset=UTF-8"}
    })
    if(result){
        const res=await result.json()
        if(res.statuscode===1){
            showSuccess("Reservation Sent", "You will be notified by mail or phone.")
            setname("")
            setemail("")
            setguest()
            setdate("")
        }
        else{
            showError("Reservation Failed", "Please check your details and try again.")
        }
    }
}
    

    return (
        <>
            <section className="auth-page">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-9 col-lg-6">
                            <div className="form-panel">
                                <p className="section-kicker">Reserve your spot</p>
                                <h1 className="mb-4">Book a Table</h1>
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input className="form-control" type="text" placeholder="Enter name" onChange={(e)=>setname(e.target.value)}></input>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input className="form-control" type="email" placeholder="Enter email" onChange={(e)=>setemail(e.target.value)}></input>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Phone</label>
                                        <input className="form-control" type="tel" placeholder="Enter Phone" onChange={(e)=>setphone(e.target.value)}></input>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Guests</label>
                                        <select className="form-select" onChange={(e)=>setguest(e.target.value)}>
                                            <option>Select person</option>
                                            <option>1</option>
                                            <option>2</option>
                                            <option>3</option>
                                            <option>4</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Date</label>
                                        <input className="form-control" type="date" onChange={(e)=>setdate(e.target.value)}></input>
                                    </div>
                                    <button className="btn btn-primary w-100 py-2" type="submit" onClick={reserve}>Reserve Now</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
