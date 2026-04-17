import { Link, NavLink } from "react-router-dom"
import "./NavBar.scss"

export const NavBar = () => {
  return (
        <nav className="navbar">
            <div className="navbar__container">
                <Link to="/" className="navbar__logo">Barber Reservatión</Link>
                <ul className="navbar__links">
                    <li>
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => isActive ? '__active' : ''}
                        >
                            Inicio
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/reservar" 
                            className={({ isActive }) => isActive ? '__active' : ''}
                        >
                            Reservar
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/admin" 
                            className={({ isActive }) => isActive ? '__active' : ''}
                        >
                            Admin
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
