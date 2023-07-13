import { UserContext } from "./context/User";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import AppRouter from "./components/AppRouter";
import api from "./config/api";
import './styles/app.css';
import './styles/variables.css';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/api/users/check/')
      .then(({data}) => {if (data.isAuth) setUser(data.user);})
      .catch(err => alert(err.message));
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Header />
      <AppRouter />
    </UserContext.Provider>
  );
}
