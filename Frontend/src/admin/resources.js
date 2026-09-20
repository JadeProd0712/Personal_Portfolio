const F = (type) => (name, label, extra = {}) => ({ name, label, type, ...extra })
const text = F('text')
const area = F('textarea')
const url = F('url')
const date = F('date')
const num = F('number')
const check = F('checkbox')
const select = F('select')
const email = F('email')
const image = F('image')

const order = [
  num('display_order', 'Display order', { default: 0, help: 'Lower numbers show first' }),
  check('is_visible', 'Visible on site', { default: true }),
]

export const RESOURCES = {
  profile: {
    title: 'Profile', singular: 'profile', endpoint: 'profile', single: true,
    label: (i) => i.full_name,
    fields: [
      text('full_name', 'Full name', { required: true }),
      text('title', 'Title', { required: true }),
      text('tagline', 'Hero tagline', { wide: true }),
      area('bio', 'Bio'),
      url('avatar_url', 'Avatar URL'),
      url('cv_url', 'CV URL'),
      image('about_image_url', 'About photo', { help: 'Leave empty to reuse your avatar' }),
      text('about_quote', 'Quote on the photo', { help: 'Example: Better Code, Bigger Dreams' }),
      num('years_learning', 'Years learning'),
      text('location', 'Location'),
      email('public_email', 'Public email'),
      url('website', 'Website'),
      url('github_url', 'GitHub URL'),
      url('linkedin_url', 'LinkedIn URL'),
      check('available_for_work', 'Available for work', { default: true }),
    ],
  },
  projects: {
    title: 'Projects', singular: 'project', endpoint: 'projects', hasImages: true,
    label: (i) => i.title,
    meta: (i) => `${i.status}${i.is_featured ? ' · featured' : ''}${i.category ? ' · ' + i.category : ''}`,
    fields: [
      text('title', 'Title', { required: true }),
      text('slug', 'URL slug', { help: 'Leave empty to auto-generate' }),
      text('summary', 'Short summary', { wide: true }),
      text('category', 'Category'),
      text('tech_stack', 'Tech stack', { help: 'Comma separated: React, Django' }),
      date('project_date', 'Project date'),
      select('status', 'Status', { options: [['draft', 'Draft'], ['published', 'Published']] }),
      select('click_behavior', 'When clicked', { options: [['case_study', 'Open case study page'], ['external', 'Open external link']] }),
      check('is_featured', 'Featured'),
      url('live_url', 'Project link (redirect)', { help: 'Visitors go here when "When clicked" is set to "Open external link". It also becomes the Live demo button.' }),
      url('repo_url', 'GitHub URL'),
      text('extra_link_label', 'Extra link label'),
      url('extra_link_url', 'Extra link URL'),
      image('cover_image_url', 'Cover image'),
      text('role', 'Your role'),
      area('overview', 'Overview'),
      area('problem', 'The problem'),
      area('features', 'Features', { help: 'One feature per line' }),
      area('challenges', 'Challenges'),
      area('lessons', 'What I learned'),
      ...order,
    ],
  },
  skills: {
    title: 'Skills', singular: 'skill', endpoint: 'skills',
    label: (i) => i.name,
    meta: (i) => `${i.category || 'Other'} · ${i.level}`,
    fields: [
      text('name', 'Name', { required: true }),
      text('category', 'Category', { help: 'Frontend, Backend, Database, Tools' }),
      select('level', 'Level', { options: [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']] }),
      num('years', 'Years of experience'),
      area('description', 'Description'),
      ...order,
    ],
  },
  experience: {
    title: 'Experience', singular: 'experience', endpoint: 'experience',
    label: (i) => `${i.job_title} at ${i.company_name}`,
    meta: (i) => i.employment_status,
    fields: [
      text('company_name', 'Company', { required: true }),
      text('job_title', 'Job title', { required: true }),
      text('employment_status', 'Type', { help: 'Full-time, Internship, Freelance' }),
      date('start_date', 'Start date'),
      date('end_date', 'End date', { help: 'Leave empty if current' }),
      area('description', 'Description'),
      ...order,
    ],
  },
  education: {
    title: 'Education', singular: 'education', endpoint: 'education',
    label: (i) => i.school_name,
    meta: (i) => [i.degree, i.field_of_study].filter(Boolean).join(', '),
    fields: [
      text('school_name', 'School', { required: true }),
      text('degree', 'Degree'),
      text('field_of_study', 'Field of study'),
      num('start_year', 'Start year'),
      num('end_year', 'End year'),
      text('status', 'Status', { help: 'Ongoing, Graduated' }),
      ...order,
    ],
  },
  certifications: {
    title: 'Certifications', singular: 'certification', endpoint: 'certifications',
    label: (i) => i.name,
    meta: (i) => i.issuing_organization,
    fields: [
      text('name', 'Name', { required: true }),
      text('issuing_organization', 'Issuing organization'),
      date('issue_date', 'Issue date'),
      date('expiration_date', 'Expiration date'),
      url('credential_url', 'Credential URL'),
      image('image_url', 'Certificate image'),
      area('description', 'Description'),
      ...order,
    ],
  },
  achievements: {
    title: 'Achievements', singular: 'achievement', endpoint: 'achievements',
    label: (i) => i.name,
    meta: (i) => i.organization,
    fields: [
      text('name', 'Name', { required: true }),
      text('category', 'Category'),
      text('organization', 'Organization'),
      date('achievement_date', 'Date'),
      url('url', 'Link'),
      image('image_url', 'Achievement image'),
      area('description', 'Description'),
      ...order,
    ],
  },
  services: {
    title: 'Services', singular: 'service', endpoint: 'services',
    label: (i) => i.name,
    meta: (i) => i.status,
    fields: [
      text('name', 'Name', { required: true }),
      text('category', 'Category'),
      num('price', 'Starting price (PHP)'),
      num('delivery_days', 'Delivery days'),
      select('status', 'Status', { options: [['available', 'Available'], ['unavailable', 'Unavailable']] }),
      area('description', 'Description'),
      ...order,
    ],
  },
}