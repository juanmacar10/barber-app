import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from "../../services/firebase";
import { Input } from "../../components/input/Input";
import { Button } from "../../components/button/Button";


export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
      console.log("Usuario logueado correctamente");

    } catch (error) {
      setError('Credenciales incorrectas, intenta de nuevo');
      console.log(error);
    }
  }



  return (
    <div className="container" style={{ paddingTop: '3rem', maxWidth: '400px' }}>
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <Input
          label='correo electronico'
          name='email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='example@gmail.com'
          required
        />
        <Input
          label='contraseña'
          name='password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='********'
          required
        />
        { error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p> }
        <Button type="submit">Iniciar Sesión</Button>
      </form>
    </div>
  )
}
