import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Context } from "./usecontext"
import { showInfo } from "./alerts"

export const Wishlist=()=>{

const [d,setd]=useState([])
const{id}=useContext(Context)

useEffect(()=>{
    if(id){
        show()
    }
},[id])


const show=async()=>{
    const result=await fetch(`http://localhost:9000/api/favourite/${id}`,{
        method:"get"
    })
    if(result){
        const res=await result.json()
        if(res.statuscode===1){
            setd(res.data)
        }
        else{
            showInfo("Wishlist Empty", "Save places from the detail page to see them here.")
        }
    }
}


    return(
        <>
    <section className="wishlist-page">
    <div className="container">
        <div className="wishlist-header">
            <div>
                <p className="section-kicker">Saved places</p>
                <h1>Your Wishlist</h1>
            </div>
            <span className="wishlist-count">{d.length} saved</span>
        </div>

        {d.length === 0 ? (
            <div className="wishlist-empty">
                <h2>No saved places yet</h2>
                <p>Places you add from the detail page will appear here.</p>
                <Link to="/" className="btn btn-primary">Explore Places</Link>
            </div>
        ) : (
        <div className="row g-4">
            {
                d.map((a)=>{
                    const placeId = a.PlaceID || a.PlaceId || a._id

                    return (
                    <div className="col-12 col-sm-6 col-lg-4" key={a._id}>
                    <article className="wishlist-card h-100">
                        <div className="wishlist-image-wrap">
                            <img src={a.Image} className="wishlist-img" alt={a.Placename} />
                        </div>
                        <div className="wishlist-body">
                            <span className="wishlist-chip">Saved</span>
                            <h3>{a.Placename}</h3>
                            <p>Keep this place handy for your next booking.</p>
                            <Link to={`/view?id=${placeId}`} className="btn btn-primary btn-sm w-100">View Details</Link>
                        </div>
                    </article>
                    </div>
                    )
                })
            }
        </div>
        )}
    </div>
    </section>

        </>
    )
}
