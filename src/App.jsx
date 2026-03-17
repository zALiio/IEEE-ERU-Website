import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'

// Dummy pages for now
const About = () => <div className="pt-32 min-h-screen text-center"><h1>About Page Coming Soon</h1></div>
const Events = () => <div className="pt-32 min-h-screen text-center"><h1>Events Page Coming Soon</h1></div>
const Teams = () => <div className="pt-32 min-h-screen text-center"><h1>Teams Page Coming Soon</h1></div>
const Dashboard = () => <div className="pt-32 min-h-screen text-center"><h1>Hidden Dashboard - Supabase Integrated</h1></div>

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/dashboard-x" element={<Dashboard />} /> {/* Hidden dashboard route */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
