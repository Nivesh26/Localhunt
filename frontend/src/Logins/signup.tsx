import React from 'react'
import Header from '../Components/Header'
import Topbar from '../Components/Topbar'
import Footer from '../Components/Footer'
import Signup_form from '../Components/Signup_form'

const signup = () => {
  return (
    <div>
        <Topbar/>
        <Header/>
        <Signup_form/>
        <Footer/>
     </div>
  )
}

export default signup