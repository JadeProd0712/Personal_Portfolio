import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

const btn =
  'inline-flex w-full items-center justify-center gap-2 rounded-full border border-line px-6 py-3.5 text-sm transition-colors hover:border-accent hover:text-accent sm:w-auto'

export default function LoadMore({ items, step = 3, children }) {
  const [visible, setVisible] = useState(step)
  const top = useRef(null)
  const shown = items.slice(0, visible)
  const remaining = items.length - shown.length

  const showLess = () => {
    setVisible(step)
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={top} className="scroll-mt-24">
      <div className="media-grid items-stretch">
        {shown.map((item, i) => (
          <motion.div
            key={item.id}
            className="h-full"
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (i % step) * 0.12 }}
          >
            {children(item, i)}
          </motion.div>
        ))}
      </div>

      {items.length > step && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="h-1 w-40 overflow-hidden rounded-full bg-line">
            <motion.div
              className="h-full rounded-full bg-accent"
              animate={{ width: `${(shown.length / items.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs uppercase tracking-widest text-muted">Showing {shown.length} of {items.length}</p>
          {remaining > 0 ? (
            <button onClick={() => setVisible((v) => v + step)} className={btn}>
              Show {Math.min(step, remaining)} more <span aria-hidden="true">↓</span>
            </button>
          ) : (
            <button onClick={showLess} className={btn}>
              Show less <span aria-hidden="true">↑</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}