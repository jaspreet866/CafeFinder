import { Routes } from "react-router-dom"
import { Route } from "react-router-dom"
import { Login } from "./login"
import { Register } from "./register"
import { Main } from "./main"
import { Place } from "./addplace"
import { PlaceView } from "./placeview"
import { Related } from "./related"
import { Reserve } from "./reservation"
import { BookRoom } from "./bookroom"
import { CoworkingSpaces } from "./cowork"
import { Account } from "./account"
import { Wishlist } from "./wishlist"
import { Admin } from "./admin"


export const Routee=()=>{


    return(
        <>
        <Routes>
            <Route path="/" element={<Main></Main>}/>
            <Route path="/register" element={<Register></Register>}></Route>
            <Route path="/login" element={<Login></Login>}></Route>
            <Route path="/place" element={<Place></Place>} />
            <Route path="/place/:id" element={<PlaceView></PlaceView>} />
            <Route path="/view" element={<PlaceView></PlaceView>}/>
            <Route path="/category" element={<Related></Related>}/>
            <Route path="/reserve" element={<Reserve></Reserve>}/>
            <Route path="/bookroom" element={<BookRoom></BookRoom>}/>
            <Route path="/cowork" element={<CoworkingSpaces />} />
            <Route path="/account" element={<Account />} />
            <Route path="/wish" element={<Wishlist></Wishlist>} />
            <Route path="/admin" element={<Admin></Admin>} />
        </Routes>
        
        </>
    )
}
