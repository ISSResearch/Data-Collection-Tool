import { UserContext } from "./context/User";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import AppRouter from "./components/AppRouter";
import axios from 'axios';
import './styles/app.css';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/api/users/check/')
      .then(({status, data}) => {if (data.isAuth) setUser(data.user);})
      .catch(err => console.log('err', err.message));
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Header />
      <AppRouter />
    </UserContext.Provider>
  );
}
