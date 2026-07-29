import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { Header } from './header';
import { Routee } from './routes';
import { Footer } from './footer';
import { useEffect } from 'react';
import AOS from 'aos';
import { Context } from './usecontext';
import { useLocation } from 'react-router-dom';
import { Chatbot } from './chatbot';



function App() {
const [id, setid] = useState("")
const [mail, setmail] = useState("")
const [utype,setutype]=useState("")
const location = useLocation()

  useEffect(()=>{
const info=JSON.parse(localStorage.getItem("data"))
if (info) {
      const parts = info.split(".")
      if (parts.length === 3) {
        const payload = parts[1]
        const enc = payload.replace(/-/g, '+').replace(/_/g, '/')
        const str = atob(enc)
        const decode = JSON.parse(str)
        const userId = decode.id
        const userMail = decode.mail
        setid(userId)
        setmail(userMail)
        setutype(decode.usrtype)
      }
    }
})

  useEffect(() => {
    AOS.init({
      duration: 750,
      easing: "ease-out-cubic",
      once: true,
      offset: 80
    });
  }, []);

  useEffect(() => {
    AOS.refreshHard();
  }, [location.pathname]);



  return (
    <div className="App">
    <Context.Provider value={{id,mail,utype,setid,setmail,setutype}}>
       <Header></Header>
       <Routee></Routee>
       <Footer></Footer>
       <Chatbot></Chatbot>
      </Context.Provider>
    </div>
  );
}

export default App;
