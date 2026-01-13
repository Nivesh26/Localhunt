import Header from '../Components/Header'
import Topbar from '../Components/Topbar'
import Footer from '../Components/Footer'
import Hero from '../assets/Hero.png'

const about = () => {
  return (
    <div className="min-h-screen bg-gray-50">   
      <Topbar/>
      <Header/>
      
      {/* Hero Section */}
      {/* <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4 md:px-10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Local Hunt
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Discovering local treasures, one product at a time
          </p>
        </div>
      </section> */}

      {/* Mission Section */}
      <section className="py-16 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                At Local Hunt, we're passionate about connecting you with authentic local products 
                crafted by talented artisans in your community. We believe that every item tells a story 
                and represents the rich culture and tradition of local craftsmanship.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Our mission is to create a platform where local artisans can showcase their work and 
                where customers can discover unique, high-quality products that support their community.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src={Hero} alt="Local products" className="w-full h-64 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-700">
                We promote eco-friendly practices and support products made with sustainable materials 
                and methods.
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-700">
                Building strong connections between local artisans and customers to strengthen 
                our community bonds.
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality</h3>
              <p className="text-gray-700">
                Ensuring every product meets our high standards of craftsmanship and authenticity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 md:px-10 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Local Hunt was born from a simple idea: that the best products are often hidden in your 
            own backyard. We started as a small team of local enthusiasts who wanted to make it easier 
            for people to discover amazing products crafted right in their communities.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            Today, we're proud to support hundreds of local artisans and provide thousands of customers 
            with access to unique, high-quality products they can't find anywhere else. Every purchase 
            you make through Local Hunt directly supports local businesses and helps preserve traditional 
            craftsmanship for future generations.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Local Hunt?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-md">
              <div className="text-3xl">🛍️</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Unique Products</h3>
                <p className="text-gray-700">
                  Discover one-of-a-kind items that reflect local culture and craftsmanship, 
                  not mass production.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-md">
              <div className="text-3xl">🎨</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Support Artisans</h3>
                <p className="text-gray-700">
                  Your purchases directly support local artists and craftspeople in your community.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-md">
              <div className="text-3xl">🌍</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Eco-Friendly</h3>
                <p className="text-gray-700">
                  Reduce your carbon footprint by shopping locally and supporting sustainable practices.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-md">
              <div className="text-3xl">💝</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Perfect Gifts</h3>
                <p className="text-gray-700">
                  Find meaningful gifts that show you care about both the recipient and your community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-10 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join the Local Movement</h2>
          <p className="text-xl mb-8 opacity-90">
            Start exploring amazing local products today and be part of something meaningful.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/shop" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </a>
            <a 
              href="/contact" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  )
}

export default about