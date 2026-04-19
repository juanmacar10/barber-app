import './Button.scss'

export const Button = ({ children, variant = 'primary', onClick = null, type = 'button', disabled = false }) => {
  // Asegurar que type sea válido para el elemento <button>
  const safeType = type === 'submit' ? 'submit' : type === 'reset' ? 'reset' : 'button'

  return (
    <button
      className={`btn btn--${variant}`}
      onClick={onClick}
      type={safeType}
      disabled={disabled}
    >
      {children}
    </button>
  )
}