import { UserContext } from "./context/User";
import { useState, useEffect } from "react";
import { useUser } from "./hooks";
import Header from "./components/Header";
import AppRouter from "./components/AppRouter";
import StatusLoad from "./components/common/StatusLoad";
import api from "./config/api";
import './styles/app.css';
import './styles/variables.css';

export default function App() {
  const { user, initUser } = useUser();
  const [statusData, setStatusData] = useState({ done: false });

  useEffect(() => {
    setStatusData({ ...statusData, progress: 20, info: 'initializing...' });
    api.get('/api/users/check/')
      .then(({ data }) => {
        setStatusData({ ...statusData, progress: 60, info: 'getting session...' });
        initUser(data.user);
        setStatusData({ ...statusData, progress: 80, info: 'getting session...' });
        setTimeout(() => setStatusData({ ...statusData, done: true }), 1000);
      })
      .catch(error => {
        setStatusData({
          error: true,
          done: false,
          progress: 0,
          info: 'app is not available ' + error.message
        });
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
