import Spinner from './Spinner'

const VARIANTS = {
  primary: 'bg-accent text-bg hover:opacity-90',
  ghost: 'border border-line hover:border-accent hover:text-accent',
  text: 'text-accent hover:opacity-80',
  textDanger: 'text-muted hover:text-red-400',
}
const SIZES = {
  md: 'rounded-full px-6 py-3 text-sm font-medium',
  sm: 'rounded-full px-4 py-2 text-sm',
  none: 'text-sm',
}

export default function Button({ loading = false, disabled = false, variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-60 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}