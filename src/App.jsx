import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/home/HomePage';
import { BookingPage } from './pages/booking/BookingPage';
import { NavBar } from './components/navbar/NavBar';
import { Footer } from './components/footer/Footer'; // Importa el Footer
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/login/LoginPage';
import { AdminPage } from './pages/admin/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main> {/* se envuelve el contenido principal para que el footer quede abajo */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reservar" element={<BookingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;