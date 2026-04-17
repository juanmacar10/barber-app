import { Children } from 'react'
import './Button.scss'

export const Button = ({ variant = 'primary', onClick, type = 'button', disabled = false }) => {
  return (
    <button 
        className={`btn btn--${variant}`}
        onClick={onClick}
        type={type}
        disabled={disabled}    
    >
        {Children}
    </button>
  )
}
