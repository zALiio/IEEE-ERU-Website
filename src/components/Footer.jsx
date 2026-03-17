const Footer = () => {
  return (
    <footer className="py-12 border-t border-white/5 bg-black/20 mt-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-heading tracking-tight">IEEE <span className="text-accent">ERU</span></span>
          </div>
          
          <div className="flex gap-8 text-gray-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>

          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} IEEE ERU Student Branch.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
