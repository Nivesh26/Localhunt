import Footer from "../Components/Footer"
import Header from "../Components/Header"
import Login_form from "../Components/Login_form"
import Topbar from "../Components/Topbar"


const login = () => {
  return (
    <div>
        <Topbar/>
        <Header/>
        <Login_form/>
        <Footer/>
    </div>
  )
}

export default login