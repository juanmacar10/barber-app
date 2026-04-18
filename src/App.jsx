import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/home/HomePage'
import { BookingPage } from './pages/booking/BookingPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/login/LoginPage'
import { AdminPage } from './pages/admin/AdminPage'
import { NavBar } from './components/navbar/NavBar'

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reservar" element={<BookingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* //ruta de admin - protegida */}
        <Route
          path='/admin'
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>

  )
}

export default App
