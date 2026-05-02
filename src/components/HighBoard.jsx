import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, UserCheck } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import '../styles/HighBoard.css'

const HighBoard = () => {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHighBoard = async () => {
      const { data, error } = await supabase
        .from('high_board')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) {
        console.error('High board fetch failed:', error)
      }

      setLeaders(data || [])
      setLoading(false)
    }

    fetchHighBoard()
  }, [])

  if (loading) return null

  return (
    <section id="high-board" className="high-board-section">
      <div className="high-board-container">
        <div className="high-board-header">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="high-board-badge"
          >
            <ShieldCheck size={12} /> STRATEGIC LEADERSHIP TIER
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="high-board-title"
          >
            HIGH <span className="text-primary">BOARD</span>
          </motion.h2>
          <p className="high-board-subtitle">The principal decision-makers guiding the branch direction and execution.</p>
        </div>

        {leaders.length === 0 ? (
          <div className="high-board-empty">No high board members added yet.</div>
        ) : (
          <div className="high-board-grid">
            {leaders.map((leader, index) => (
              <motion.div
                key={leader.id || `${leader.name}-${index}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="high-board-card"
              >
                <div className="high-board-avatar-wrap">
                  <img
                    src={leader.image_url}
                    alt={leader.name}
                    className="high-board-avatar"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name || 'High Board')}&background=0D1117&color=007ACC`
                    }}
                  />
                </div>

                <div className="high-board-content">
                  <p className="high-board-role">
                    <UserCheck size={12} /> {leader.role || 'Board Member'}
                  </p>
                  <h3 className="high-board-name">{leader.name}</h3>
                  {leader.bio ? <p className="high-board-bio">{leader.bio}</p> : null}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default HighBoard
