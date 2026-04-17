import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/homePage/HomePage'
import { BookingPage } from './pages/bookingPage/BookingPage'
import { AdminPage } from './pages/adminPage/AdminPage'
import { NavBar } from './components/navbar/NavBar'

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes> 
        <Route path="/" element={<HomePage />} />
        <Route path="/reservar" element={ <BookingPage />}/>
        <Route path="/admin" element={ <AdminPage /> } />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
