import './Button.scss'

export const Button = ({ children, variant = 'primary', onClick, type = 'button', disabled = false }) => {
  return (
    <button 
        className={`btn btn--${variant}`}
        onClick={onClick}
        type={type}
        disabled={disabled}    
    >
        {children}
    </button>
  )
}
