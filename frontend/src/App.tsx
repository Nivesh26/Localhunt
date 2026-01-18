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
import AdminVender from './AdminPages/AdminVendor'
import VendorApprove from './AdminPages/VendorApprove'
import SellerLogin from './Logins/SellerLogin'
import AdminProduct from './AdminPages/AdminProduct'
import AdminSetting from './AdminPages/AdminSetting'
import SellerDashboard from './SellerPages/SellerDashboard'
import SellerProduct from './SellerPages/SellerProduct'
import SellerOrder from './SellerPages/SellerOrder'
import SellerHistory from './SellerPages/SellerHistory'
import SellerPayout from './SellerPages/SellerPayout'
import SellerMessage from './SellerPages/SellerMessage'
import SellerSetting from './SellerPages/SellerSetting'
import AdminUser from './AdminPages/AdminUser'
import Changepassword from './Pages/Changepassord'
import SellerChangepassword from './SellerPages/SellerChangepassword'
import ProtectedRoute from './Components/ProtectedRoute'
import Checkout from './Pages/Checkout'
import Payment from './Pages/Payment'
import COD from './Pages/COD'
import OrderTracking from './Pages/OrderTracking'
import { UserOTP } from './Pages/UserOTP'
import { SellerOTP } from './SellerPages/SellerOTP'
import UserForgetPassword from './Pages/UserForgetPassword'
import SellerForgetPassword from './SellerPages/SellerForgetPassword'
import GlobalChatWidget from './Components/GlobalChatWidget'


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
      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
          <Cart/>
        </ProtectedRoute>
      }/>
      <Route path="/productdetail/:id" element={<Productdetail/>}/>
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
          <Profile/>
        </ProtectedRoute>
      }/>
      <Route path="/changepassword" element={
        <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
          <Changepassword/>
        </ProtectedRoute> 
      }/>
      <Route path="/checkout" element={
        <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
          <Checkout/>
        </ProtectedRoute>
      }/>
      <Route path="/payment" element={
        <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
          <Payment/>
        </ProtectedRoute>
      }/>
      <Route path="/cod" element={
        <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
          <COD/>
        </ProtectedRoute>
      }/>
      <Route path="/ordertracking" element={
        <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
          <OrderTracking/>
        </ProtectedRoute>
      }/>
      
      {/* Login and Signup */}
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/userotp" element={<UserOTP/>}/>
      <Route path="/userforgetpassword" element={<UserForgetPassword/>}/>

      
      {/* Seller Login and Signup */}
      <Route path="/sellersignup" element={<Sellersignup/>}/>
      <Route path="/sellerlogin" element={<SellerLogin/>}/>
      <Route path="/sellerotp" element={<SellerOTP/>}/>
      <Route path="/sellerforgetpassword" element={<SellerForgetPassword/>}/>
     

      {/* Seller Pages - Protected: VENDOR only */}
      <Route path="/sellerdashboard" element={
        <ProtectedRoute allowedRoles={['VENDOR']}>
          <SellerDashboard/>
        </ProtectedRoute>
      }/>
      <Route path="/sellerproduct" element={
        <ProtectedRoute allowedRoles={['VENDOR']}>
          <SellerProduct/>
        </ProtectedRoute>
      }/>
      <Route path="/sellerorder" element={
        <ProtectedRoute allowedRoles={['VENDOR']}>
          <SellerOrder/>
        </ProtectedRoute>
      }/>
      <Route path="/sellerhistory" element={
        <ProtectedRoute allowedRoles={['VENDOR']}>
          <SellerHistory/>
        </ProtectedRoute>
      }/>
      <Route path="/sellerpayout" element={
        <ProtectedRoute allowedRoles={['VENDOR']}>
          <SellerPayout/>
        </ProtectedRoute>
      }/>
      <Route path="/sellermessage" element={
        <ProtectedRoute allowedRoles={['VENDOR']}>
          <SellerMessage/>
        </ProtectedRoute>
      }/>
      <Route path="/sellersetting" element={
        <ProtectedRoute allowedRoles={['VENDOR']}>
          <SellerSetting/>
        </ProtectedRoute>
      }/>
      <Route path="/sellerchangepassword" element={
        <ProtectedRoute allowedRoles={['VENDOR']}>
          <SellerChangepassword/>
        </ProtectedRoute>
      }/>

      {/* Admin Pages - Protected: SUPERADMIN only */}
      <Route path="/admindashboard" element={
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
          <AdminDashboard/>
        </ProtectedRoute>
      }/>
      <Route path="/adminvendors" element={
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
          <AdminVender/>
        </ProtectedRoute>
      }/>
      <Route path="/adminvendorsapprove" element={
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
          <VendorApprove/>
        </ProtectedRoute>
      }/>
      <Route path="/adminproducts" element={
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
          <AdminProduct/>
        </ProtectedRoute>
      }/>
      <Route path="/adminsettings" element={
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
          <AdminSetting/>
        </ProtectedRoute>
      }/>  
      <Route path="/adminuser" element={
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
          <AdminUser/>
        </ProtectedRoute>
      }/>
   </Routes> 
   <ToastContainer position="top-right" autoClose={3000} />
   <GlobalChatWidget />
   </BrowserRouter>

  )
}

export default App