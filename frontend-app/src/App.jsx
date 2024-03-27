import { ReactElement, useState, useEffect } from "react";
import { api } from "./config/api";
import { setUser } from "./slices/users";
import { addAlert } from "./slices/alerts";
import { useDispatch } from "react-redux";
import AppRouter from "./components/AppRouter";
import Header from "./components/Header";
import StatusLoad from "./components/ui/StatusLoad";
import AlertManager from "./components/AlertManager";
import './app.css';

/** @returns {ReactElement} */
export default function App() {
  const dispatch = useDispatch();
  const [statusData, setStatusData] = useState({ done: false });

  useEffect(() => {
    setStatusData({ ...statusData, progress: 20, info: 'initializing...' });

    const accessToken = localStorage.getItem("dtcAccess");
    setStatusData({ ...statusData, progress: 60, info: 'checking session...' });

    api.get('/api/users/check/', { headers: { "Authorization": "Bearer " + accessToken } })
      .then(({ data }) => {
        if (data.isAuth) {
          setStatusData({ ...statusData, progress: 80, info: 'preparing session...' });
          dispatch(setUser(data.user));
          dispatch(addAlert({ message: "Session checked", type: "success" }));
        }
        setStatusData({ ...statusData, done: true });
      })
      .catch(({ message, response }) => {
        var authFailed = response?.status === 403 || response?.status === 401;
        var payload = {
          messsage: "User check failed: " + message,
          type: "error",
          noSession: authFailed
        };
        dispatch(addAlert(payload));

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
    <>
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
    </>
  );
}
