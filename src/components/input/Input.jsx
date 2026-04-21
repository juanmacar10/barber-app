import './Input.scss'

export const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  ...rest //Captura el resto de props (min, max, etc.) por lo que no es necesario especificarlos
}) => {
  return (
    <div className="input-group">
      {label && <label className="input-group__label">{label}</label>}
      <input
        type={type}
        name={name}
        className="input-group__field"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...rest}   // Esparce las props adicionales al input
      />
    </div>
  )
}