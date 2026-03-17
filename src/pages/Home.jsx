import Hero from '../components/Hero'
import About from '../components/About'

const Home = () => {
  return (
    <div className="page-home overflow-x-hidden">
      <Hero />
      <About />
      
      {/* Any additional sections can be added here or imported as components */}
      <section className="py-24 bg-black/20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Innovate?</h2>
        <p className="text-gray-400 mb-8 px-6">Join IEEE ERU today and start your journey with the world largest engineering community.</p>
        <button className="btn-primary">Become a Member</button>
      </section>
    </div>
  )
}

export default Home
