import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';
import ProtectedRoute from './ProtectedRoute';

// User Pages
import Home from '../Pages/home';
import New from '../Pages/newproduct';
import Shop from '../Pages/shop';
import About from '../Pages/about';
import Contact from '../Pages/contact';
import Cart from '../Pages/Cart';
import Productdetail from '../Pages/Productdetail';
import Profile from '../Pages/Profie';
import Changepassword from '../Pages/Changepassord';
import Checkout from '../Pages/Checkout';
import Payment from '../Pages/Payment';
import COD from '../Pages/COD';
import OrderTracking from '../Pages/OrderTracking';
import { UserOTP } from '../Pages/UserOTP';
import UserForgetPassword from '../Pages/UserForgetPassword';

// Login and Signup
import Login from '../Logins/login';
import Signup from '../Logins/signup';
import Sellersignup from '../Logins/SellerSignup';
import SellerLogin from '../Logins/SellerLogin';
import { SellerOTP } from '../SellerPages/SellerOTP';
import SellerForgetPassword from '../SellerPages/SellerForgetPassword';

// Admin Pages
import AdminDashboard from '../AdminPages/AdminDashboard';
import AdminVender from '../AdminPages/AdminVendor';
import VendorApprove from '../AdminPages/VendorApprove';
import VendorDetail from '../AdminPages/VendorDetail';
import AdminProduct from '../AdminPages/AdminProduct';
import AdminReviews from '../AdminPages/AdminReviews';
import AdminSetting from '../AdminPages/AdminSetting';
import AdminChangePassword from '../AdminPages/AdminChangePassword';
import AdminUser from '../AdminPages/AdminUser';

// Seller Pages
import SellerDashboard from '../SellerPages/SellerDashboard';
import SellerProduct from '../SellerPages/SellerProduct';
import SellerOrder from '../SellerPages/SellerOrder';
import SellerHistory from '../SellerPages/SellerHistory';
import SellerPayout from '../SellerPages/SellerPayout';
import SellerMessage from '../SellerPages/SellerMessage';
import SellerSetting from '../SellerPages/SellerSetting';
import SellerReviews from '../SellerPages/SellerReviews';
import SellerChangepassword from '../SellerPages/SellerChangepassword';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* User Pages with Transitions */}
        <Route path="/" element={
          <PageTransition>
            <Home />
          </PageTransition>
        } />
        <Route path="/new" element={
          <PageTransition>
            <New />
          </PageTransition>
        } />
        <Route path="/shop" element={
          <PageTransition>
            <Shop />
          </PageTransition>
        } />
        <Route path="/about" element={
          <PageTransition>
            <About />
          </PageTransition>
        } />
        <Route path="/contact" element={
          <PageTransition>
            <Contact />
          </PageTransition>
        } />
        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
            <PageTransition>
              <Cart />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/productdetail/:id" element={
          <PageTransition>
            <Productdetail />
          </PageTransition>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
            <PageTransition>
              <Profile />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/changepassword" element={
          <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
            <PageTransition>
              <Changepassword />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
            <PageTransition>
              <Checkout />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
            <PageTransition>
              <Payment />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/cod" element={
          <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
            <PageTransition>
              <COD />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/ordertracking" element={
          <ProtectedRoute allowedRoles={['USER']} redirectTo="/login">
            <PageTransition>
              <OrderTracking />
            </PageTransition>
          </ProtectedRoute>
        } />

        {/* Login and Signup with Transitions */}
        <Route path="/login" element={
          <PageTransition>
            <Login />
          </PageTransition>
        } />
        <Route path="/signup" element={
          <PageTransition>
            <Signup />
          </PageTransition>
        } />
        <Route path="/userotp" element={
          <PageTransition>
            <UserOTP />
          </PageTransition>
        } />
        <Route path="/userforgetpassword" element={
          <PageTransition>
            <UserForgetPassword />
          </PageTransition>
        } />

        {/* Seller Login and Signup */}
        <Route path="/sellersignup" element={<Sellersignup />} />
        <Route path="/sellerlogin" element={<SellerLogin />} />
        <Route path="/sellerotp" element={<SellerOTP />} />
        <Route path="/sellerforgetpassword" element={<SellerForgetPassword />} />

        {/* Seller Pages - Protected: VENDOR only */}
        <Route path="/sellerdashboard" element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <SellerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/sellerproduct" element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <SellerProduct />
          </ProtectedRoute>
        } />
        <Route path="/sellerorder" element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <SellerOrder />
          </ProtectedRoute>
        } />
        <Route path="/sellerhistory" element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <SellerHistory />
          </ProtectedRoute>
        } />
        <Route path="/sellerreviews" element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <SellerReviews />
          </ProtectedRoute>
        } />
        <Route path="/sellerpayout" element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <SellerPayout />
          </ProtectedRoute>
        } />
        <Route path="/sellermessage" element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <SellerMessage />
          </ProtectedRoute>
        } />
        <Route path="/sellersetting" element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <SellerSetting />
          </ProtectedRoute>
        } />
        <Route path="/sellerchangepassword" element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <SellerChangepassword />
          </ProtectedRoute>
        } />

        {/* Admin Pages - Protected: SUPERADMIN only */}
        <Route path="/admindashboard" element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/adminvendors" element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <AdminVender />
          </ProtectedRoute>
        } />
        <Route path="/adminvendordetail/:id" element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <VendorDetail />
          </ProtectedRoute>
        } />
        <Route path="/adminvendorsapprove" element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <VendorApprove />
          </ProtectedRoute>
        } />
        <Route path="/adminproducts" element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <AdminProduct />
          </ProtectedRoute>
        } />
        <Route path="/adminreviews" element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <AdminReviews />
          </ProtectedRoute>
        } />
        <Route path="/adminsettings" element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <AdminSetting />
          </ProtectedRoute>
        } />
        <Route path="/adminchangepassword" element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <AdminChangePassword />
          </ProtectedRoute>
        } />
        <Route path="/adminuser" element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <AdminUser />
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
