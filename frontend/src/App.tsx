import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './Pages/home'
import New from './Pages/newproduct'
import Login from './Logins/login'
import Signup from './Logins/signup'
import Shop from './Pages/shop'
import About from './Pages/about'
import Contact from './Pages/contact'
import Cart from './Pages/Cart'
import Productdetail from './Pages/Productdetail'
import Profile from './Pages/Profie'
import Sellersignup from './Logins/SellerSignup'
import AdminDashboard from './AdminPages/AdminDashboard'
import Vendorpipeline from './AdminPages/Vendorpipeline'
import AdminVender from './AdminPages/AdminVendor'
import VendorApprove from './AdminPages/VendorApprove'
import SellerLogin from './Logins/SellerLogin'
import AdminProduct from './AdminPages/AdminProduct'
import AdminSetting from './AdminPages/AdminSetting'
import SellerDashboard from './SellerPages/SellerDashboard'
import SellerProduct from './SellerPages/SellerProduct'
import SellerOrder from './SellerPages/SellerOrder'
import SellerPayout from './SellerPages/SellerPayout'
import SellerMessage from './SellerPages/SellerMessage'
import SellerSetting from './SellerPages/SellerSetting'
import AdminUser from './AdminPages/AdminUser'

const App = () => {
  return (
   <BrowserRouter>
   <Routes>
    {/* User Pages */}
      <Route path="/" element={<Home/>} />
      <Route path="/new" element={<New/>}/>
      <Route path="/shop" element={<Shop/>}/>
      <Route path="/about" element={<About/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/cart" element={<Cart/>}/>
      <Route path="/productdetail/:id" element={<Productdetail/>}/>
      <Route path="/profile" element={<Profile/>}/>

      {/* Login and Signup */}
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>

      {/* Seller Login and Signup */}
      <Route path="/sellersignup" element={<Sellersignup/>}/>
      <Route path="/sellerlogin" element={<SellerLogin/>}/>
     

      {/* Seller Pages */}
      <Route path="/sellerdashboard" element={<SellerDashboard/>}/>
      <Route path="/sellerproduct" element={<SellerProduct/>}/>
      <Route path="/sellerorder" element={<SellerOrder/>}/>
      <Route path="/sellerpayout" element={<SellerPayout/>}/>
      <Route path="/sellermessage" element={<SellerMessage/>}/>
      <Route path="/sellersetting" element={<SellerSetting/>}/>

      {/* Admin Pages */}
        <Route path="/admindashboard" element={<AdminDashboard/>}/>
        <Route path="/adminvendors" element={<AdminVender/>}/>
        <Route path="/adminvendorsapprove" element={<VendorApprove/>}/>
        <Route path="/adminproducts" element={<AdminProduct/>}/>
        <Route path="/adminsettings" element={<AdminSetting/>}/>  
        <Route path="/adminuser" element={<AdminUser/>}/>
   </Routes> 
   <ToastContainer position="top-right" autoClose={3000} />
   </BrowserRouter>

  )
}

export default App