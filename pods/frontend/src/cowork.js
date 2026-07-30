import { useState } from "react"
import { FaBriefcase, FaCalendarAlt, FaWifi } from "react-icons/fa"
import { showError, showSuccess } from "./alerts"

export const CoworkingSpaces = () => {

const [name,setname]=useState("")
const[email,setemail]=useState("")
const[phone,setphone]=useState()
const [type,settype]=useState("")

const add=async(e)=>{
    e.preventDefault()
    const result=await fetch("https://cafefinder-u2me.onrender.com/api/cowork",{
        method:"post",
        body:JSON.stringify({name,email,phone,type}),
        headers:{"Content-type":"application/json;charset=UTF-8"}
    })
    if(result){
        const res=await result.json()
        if(res.statuscode===1){
            showSuccess("Request Sent", "We will contact you about your coworking space.")
            setname("")
            setemail("")
            setphone("")
            settype("")
        }
        else{
            showError("Request Failed", "Please check your details and try again.")
        }
    }
}









    const spaces = [
        {
            title: "Single Desk",
            text: "A quiet setup for focused work and daily tasks.",
            price: "From ₹299/day"
        },
        {
            title: "Meeting Room",
            text: "Private room for calls, reviews, and team planning.",
            price: "From ₹799/hour"
        },
        {
            title: "Private Office",
            text: "A dedicated office for teams that need privacy.",
            price: "From ₹2499/day"
        }
    ]

    return (
        <>  
            <section className="cowork-page">
                <div className="container">
                    <div className="row align-items-center g-4 g-lg-5">
                        <div className="col-lg-5">
                            <div className="cowork-copy animate-fade-up">
                                <p className="section-kicker">Work your way</p>
                                <h1>Book a coworking space that fits your day.</h1>
                                <p>
                                    Choose a desk, meeting room, or private office with the essentials ready:
                                    fast WiFi, calm seating, and flexible booking.
                                </p>

                                <div className="cowork-features">
                                    <span><FaWifi /> Fast WiFi</span>
                                    <span><FaBriefcase /> Work ready</span>
                                    <span><FaCalendarAlt /> Flexible slots</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="cowork-panel animate-fade-up delay-1">
                                <div className="cowork-options">
                                    {spaces.map((space) => (
                                        <article className="cowork-option" key={space.title}>
                                            <h3>{space.title}</h3>
                                            <p>{space.text}</p>
                                            <strong>{space.price}</strong>
                                        </article>
                                    ))}
                                </div>

                                <form className="cowork-form">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Name</label>
                                            <input className="form-control" type="text" placeholder="Enter name" onChange={(e)=>setname(e.target.value)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email</label>
                                            <input className="form-control" type="email" placeholder="Enter email" onChange={(e)=>setemail(e.target.value)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Phone Number</label>
                                            <input className="form-control" type="tel" placeholder="Enter phone number" onChange={(e)=>setphone(e.target.value)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Space Type</label>
                                            <select className="form-select" defaultValue="" onChange={(e)=>settype(e.target.value)}>
                                                <option value="" disabled>Select a space</option>
                                                <option>Single Desk</option>
                                                <option>Double Desk</option>
                                                <option>Meeting Room</option>
                                                <option>Private Office</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <button className="btn btn-primary w-100 py-2" type="submit" onClick={add}>
                                                Request Space
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
