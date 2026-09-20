import Reveal from './Reveal'

export default function Section({ id, number, label, children }) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-line py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-10 text-sm uppercase tracking-widest text-accent">
            {number} — {label}
          </p>
        </Reveal>
        {children}
      </div>
    </section>
  )
}