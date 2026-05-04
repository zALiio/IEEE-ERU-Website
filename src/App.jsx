import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import FixedPortalButton from './components/FixedPortalButton'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollUpButton from './components/ScrollUpButton'

const Home = lazy(() => import('./pages/Home'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const BoardPage = lazy(() => import('./pages/BoardPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'))
const JoinUsPage = lazy(() => import('./pages/JoinUsPage'))
const MemberPortal = lazy(() => import('./pages/MemberPortal'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <ScrollUpButton />
        <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Suspense
            fallback={
              <div className="min-h-[60vh] flex items-center justify-center text-white/40 text-sm uppercase tracking-[0.4em]">
                Loading...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/board" element={<BoardPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/join" element={<JoinUsPage />} />
              <Route path="/member" element={<MemberPortal />} />
              <Route path="/dashboard" element={<AdminDashboard />} /> {/* Hidden dashboard route */}
            </Routes>
          </Suspense>
        </main>
        <FixedPortalButton />
        <Footer />
      </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
