import { UserContext } from "./context/User";
import { useState, useEffect } from "react";
import { useUser } from "./hooks";
import { api } from "./config/api";
import Header from "./components/Header";
import AppRouter from "./components/AppRouter";
import StatusLoad from "./components/ui/StatusLoad";
import './app.css';

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
          initUser(data.user);
        }
        setTimeout(() => setStatusData({ ...statusData, done: true }), 1000);
      })
      .catch(({ message, response }) => {
        if (response.status === 403 || response.status === 401) {
          localStorage.removeItem("dtcAccess");
          setTimeout(() => setStatusData({ ...statusData, done: true }), 1000);
        }
        else setStatusData({
          error: true,
          done: false,
          progress: 0,
          info: 'app is not available ' + message
        });
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, initUser }}>
      <Header />
      {
        !statusData.done
          ? <div className="iss__main__loadWrap">
            <StatusLoad
              progress={statusData.progress}
              info={statusData.info}
              error={statusData.error}
            />
          </div>
          : <AppRouter />
      }
    </UserContext.Provider>
  );
}
