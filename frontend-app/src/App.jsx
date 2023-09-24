import { UserContext } from "./context/User";
import { useState, useEffect } from "react";
import { useUser } from "./hooks";
import { api } from "./config/api";
import Header from "./components/Header";
import AppRouter from "./components/AppRouter";
import StatusLoad from "./components/common/StatusLoad";
import './styles/app.css';
import './styles/variables.css';
import jwt_decode from "jwt-decode";

export default function App() {
  const { user, initUser } = useUser();
  const [statusData, setStatusData] = useState({ done: false });

  useEffect(() => {
    setStatusData({ ...statusData, progress: 20, info: 'initializing...' });
    setStatusData({ ...statusData, progress: 40, info: 'getting session...' });
    const accessToken = localStorage.getItem("dtcAccess");
    setStatusData({ ...statusData, progress: 60, info: 'checking session...' });
    api.get('/api/users/check/', { headers: { "Authorization": "Bearer " + accessToken } })
      .then(({ data }) => {
        if (data.isAuth) {
          setStatusData({ ...statusData, progress: 80, info: 'preparing session...' });
          initUser(jwt_decode(accessToken));
        }
        setTimeout(() => setStatusData({ ...statusData, done: true }), 1000);
      })
      .catch(({ message, response }) => {
        if (response.status !== 401)
          setStatusData({
            error: true,
            done: false,
            progress: 0,
            info: 'app is not available ' + message
          });
        else setTimeout(() => setStatusData({ ...statusData, done: true }), 1000);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, initUser }}>
      <Header />
      {
        !statusData.done
          ? <div className="iss__main__loadWrap">
            <StatusLoad progress={statusData.progress} info={statusData.info} error={statusData.error} />
          </div>
          : <AppRouter />
      }
    </UserContext.Provider>
  );
}
