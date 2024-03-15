import { UserContext } from "./context/User";
import { AlertContext } from "./context/Alert";
import { ReactElement, useState, useEffect } from "react";
import { useUser, useAlerts } from "./hooks";
import { api } from "./config/api";
import AppRouter from "./components/AppRouter";
import Header from "./components/Header";
import StatusLoad from "./components/ui/StatusLoad";
import AlertManager from "./components/AlertManager";
import './app.css';

/** @returns {ReactElement} */
export default function App() {
  const { user, initUser } = useUser();
  const alertManager = useAlerts();
  const [statusData, setStatusData] = useState({ done: false });

  useEffect(() => {
    setStatusData({ ...statusData, progress: 20, info: 'initializing...' });

    const accessToken = localStorage.getItem("dtcAccess");
    setStatusData({ ...statusData, progress: 60, info: 'checking session...' });

    api.get('/api/users/check/', { headers: { "Authorization": "Bearer " + accessToken } })
      .then(({ data }) => {
        if (data.isAuth) {
          setStatusData({ ...statusData, progress: 80, info: 'preparing session...' });
          initUser(data.user);
          alertManager.addAlert("Session checked", "success");
        }
        setStatusData({ ...statusData, done: true });
      })
      .catch(({ message, response }) => {
        var authFailed = response?.status === 403 || response?.status === 401;

        alertManager.addAlert("User check failed: " + message, "error", authFailed);

        if (authFailed) {
          localStorage.removeItem("dtcAccess");
          setStatusData({ ...statusData, done: true });
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
    <AlertContext.Provider value={ alertManager }>
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
      <AlertManager maxOnScreen={5} />
    </AlertContext.Provider>
    </UserContext.Provider>
  );
}
