import Hero from '../components/Hero'
import Section from '../components/Section'
import WorkSection from '../components/WorkSection'
import AboutSection from '../components/AboutSection'
import ExpertiseSection from '../components/ExpertiseSection'
import ContactSection from '../components/ContactSection'

export default function Home({ profile }) {
  return (
    <>
      <Hero profile={profile} />

      <Section id="work" number="01" label="Selected work">
        <WorkSection featuredOnly />
      </Section>

      <Section id="about" number="02" label="About">
        <AboutSection profile={profile} />
      </Section>

      <Section id="expertise" number="03" label="Expertise">
        <ExpertiseSection />
      </Section>

      <Section id="contact" number="04" label="Contact">
        <ContactSection profile={profile} />
      </Section>

      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} {profile?.full_name || 'Your Name'}
      </footer>
    </>
  )
}