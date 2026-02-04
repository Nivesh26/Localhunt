import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AnimatedRoutes from './Components/AnimatedRoutes'
import GlobalChatWidget from './Components/GlobalChatWidget'
import ScrollToTop from './Components/ScrollToTop'

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatedRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
      <GlobalChatWidget />
    </BrowserRouter>
  )
}

export default App