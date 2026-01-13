import BestSellers from "../Components/Bestseller"
import Categories from "../Components/Categories"
import Footer from "../Components/Footer"
import Header from "../Components/Header"
import Hero from "../Components/Hero"
import ProductHighlights from "../Components/ProductHighlights"
import Shopnow from "../Components/Shopnow"
import Topbar from "../Components/Topbar"


const home = () => {
  return (
<div>
    <Topbar/>
    <Header/>
    <Hero /> 
    <BestSellers/>
    <Categories/>
    <ProductHighlights/>
    <Shopnow/>
    <Footer/>
</div>
  )
}

export default home