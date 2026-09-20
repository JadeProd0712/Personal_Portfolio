import { Document, Page, Text, View, Link, StyleSheet, pdf } from '@react-pdf/renderer'

const MAX_PROJECTS = 4 // keeps the CV close to one page
const MAX_BULLETS = 4

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 36, paddingHorizontal: 46, fontFamily: 'Times-Roman', fontSize: 10.5, lineHeight: 1.3, color: '#000' },
  name: { fontFamily: 'Times-Bold', fontSize: 20, textAlign: 'center', letterSpacing: 1 },
  title: { fontFamily: 'Times-Italic', fontSize: 11, textAlign: 'center', marginTop: 2 },
  contact: { fontSize: 10, textAlign: 'center', marginTop: 3 },
  link: { color: '#000', textDecoration: 'none' },
  heading: { fontFamily: 'Times-Bold', fontSize: 11, borderBottomWidth: 0.75, borderBottomColor: '#000', marginTop: 10, marginBottom: 4, paddingBottom: 1 },
  entry: { marginBottom: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  left: { flex: 1, paddingRight: 8 },
  right: { textAlign: 'right' },
  bold: { fontFamily: 'Times-Bold' },
  italic: { fontFamily: 'Times-Italic' },
  bulletRow: { flexDirection: 'row', marginTop: 1.5, paddingLeft: 10 },
  bullet: { width: 10 },
  bulletText: { flex: 1 },
})

/* ---------- helpers ---------- */
const monthYear = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : ''
const year = (iso) => (iso ? new Date(iso).getUTCFullYear() : '')
// Drops tracking parameters (everything after ?) and shortens long links
const cleanHref = (u) => {
  try {
    const x = new URL(u)
    return x.origin + x.pathname.replace(/\/$/, '')
  } catch {
    return u
  }
}
const strip = (u) => {
  const t = cleanHref(u).replace(/^https?:\/\/(www\.)?/, '')
  return t.length > 45 ? t.slice(0, 42) + '...' : t
}
const lines = (t) =>
  (t || '').split('\n').map((x) => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)

/* ---------- building blocks ---------- */
const Section = ({ title, children }) => (
  <View>
    <Text style={s.heading} minPresenceAhead={40}>{title.toUpperCase()}</Text>
    {children}
  </View>
)

const Row = ({ left, right }) => (
  <View style={s.row}>
    <Text style={s.left}>{left}</Text>
    {right ? <Text style={s.right}>{right}</Text> : null}
  </View>
)

const Bullets = ({ items }) =>
  items.map((t, i) => (
    <View key={i} style={s.bulletRow} wrap={false}>
      <Text style={s.bullet}>•</Text>
      <Text style={s.bulletText}>{t}</Text>
    </View>
  ))

/* ---------- document ---------- */
function ResumeDoc({ data }) {
  const {
    profile: p = {},
    education = [], experience = [], skills = [],
    projects = [], certifications = [], achievements = [],
  } = data

  const contacts = [
    p.location && { text: p.location },
    p.public_email && { text: p.public_email, href: `mailto:${p.public_email}` },
    p.github_url && { text: strip(p.github_url), href: p.github_url },
    p.linkedin_url && { text: strip(p.linkedin_url), href: p.linkedin_url },
    p.website && { text: strip(p.website), href: p.website },
  ].filter(Boolean)

  const bio = (p.bio || '').replace(/\s+/g, ' ').trim()
  const summary = bio.length > 420 ? bio.slice(0, 417).trimEnd() + '...' : bio

  const groups = skills.reduce((acc, x) => {
    ;(acc[x.category || 'Other'] ||= []).push(x.name)
    return acc
  }, {})

  const topProjects = [...projects]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .slice(0, MAX_PROJECTS)

  return (
    <Document title={`${p.full_name || 'Resume'} - Resume`} author={p.full_name}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{(p.full_name || '').toUpperCase()}</Text>
        {p.title ? <Text style={s.title}>{p.title}</Text> : null}
        {contacts.length > 0 && (
          <Text style={s.contact}>
            {contacts.map((c, i) => (
              <Text key={i}>
                {i > 0 ? '  |  ' : ''}
                {c.href ? <Link src={c.href} style={s.link}>{c.text}</Link> : c.text}
              </Text>
            ))}
          </Text>
        )}

        {summary ? (
          <Section title="Professional Summary">
            <Text>{summary}</Text>
          </Section>
        ) : null}

        {education.length > 0 && (
          <Section title="Education">
            {education.map((e) => (
              <View key={e.id} style={s.entry} wrap={false}>
                <Row
                  left={<Text style={s.bold}>{e.school_name}</Text>}
                  right={[e.start_year, e.end_year || (e.start_year ? 'Present' : '')].filter(Boolean).join(' – ')}
                />
                <Text style={s.italic}>
                  {[[e.degree, e.field_of_study].filter(Boolean).join(', '), e.status].filter(Boolean).join(' (')}
                  {e.degree && e.status ? ')' : ''}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {experience.length > 0 && (
          <Section title="Experience">
            {experience.map((x) => (
              <View key={x.id} style={s.entry} wrap={false}>
                <Row
                  left={<Text style={s.bold}>{x.company_name}</Text>}
                  right={x.start_date ? `${monthYear(x.start_date)} – ${x.end_date ? monthYear(x.end_date) : 'Present'}` : ''}
                />
                <Text style={s.italic}>{[x.job_title, x.employment_status].filter(Boolean).join(', ')}</Text>
                <Bullets items={lines(x.description)} />
              </View>
            ))}
          </Section>
        )}

        {topProjects.length > 0 && (
          <Section title="Projects">
            {topProjects.map((pr) => {
              const feats = pr.features_list?.length ? pr.features_list : pr.summary ? [pr.summary] : []
              const links = [pr.live_url, pr.repo_url].filter(Boolean)
              return (
                <View key={pr.id} style={s.entry} wrap={false}>
                  <Row
                    left={
                      <>
                        <Text style={s.bold}>{pr.title}</Text>
                        {pr.tech_list?.length ? ` | ${pr.tech_list.join(', ')}` : ''}
                      </>
                    }
                    right={String(year(pr.project_date) || '')}
                  />
                  {pr.role ? <Text style={s.italic}>{pr.role}</Text> : null}
                  <Bullets items={feats.slice(0, MAX_BULLETS)} />
                  {links.length > 0 && (
                    <Text style={[s.italic, { paddingLeft: 10, marginTop: 1.5 }]}>
                      {links.map((u, i) => (
                        <Text key={u}>{i > 0 ? '  |  ' : ''}<Link src={cleanHref(u)} style={s.link}>{strip(u)}</Link></Text>
                      ))}
                    </Text>
                  )}
                </View>
              )
            })}
          </Section>
        )}

        {Object.keys(groups).length > 0 && (
          <Section title="Technical Skills">
            {Object.entries(groups).map(([cat, names]) => (
              <Text key={cat} style={{ marginBottom: 2 }}>
                <Text style={s.bold}>{cat}: </Text>
                {names.join(', ')}
              </Text>
            ))}
          </Section>
        )}

        {certifications.length > 0 && (
          <Section title="Certifications">
            {certifications.map((c) => (
              <View key={c.id} style={{ marginBottom: 3 }} wrap={false}>
                <Row
                  left={
                    <>
                      <Text style={s.bold}>{c.name}</Text>
                      {c.issuing_organization ? `, ${c.issuing_organization}` : ''}
                    </>
                  }
                  right={monthYear(c.issue_date)}
                />
              </View>
            ))}
          </Section>
        )}

        {achievements.length > 0 && (
          <Section title="Achievements">
            {achievements.map((a) => (
              <View key={a.id} style={{ marginBottom: 3 }} wrap={false}>
                <Row
                  left={
                    <>
                      <Text style={s.bold}>{a.name}</Text>
                      {a.organization ? `, ${a.organization}` : ''}
                    </>
                  }
                  right={monthYear(a.achievement_date)}
                />
                <Bullets items={lines(a.description).slice(0, 2)} />
              </View>
            ))}
          </Section>
        )}
      </Page>
    </Document>
  )
}

export async function downloadResume(data) {
  const blob = await pdf(<ResumeDoc data={data} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(data.profile?.full_name || 'Resume').trim().replace(/\s+/g, '_')}_Resume.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}