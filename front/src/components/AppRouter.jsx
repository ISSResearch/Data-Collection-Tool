import { Route, Routes } from "react-router-dom";
import { UserContext } from "../context/User";
import { useContext } from "react";
import { routes } from '../config/routes';
import Login from "../pages/Login";
import Registration from "../pages/Registration";

export default function AppRouter() {
  const { user } = useContext(UserContext);

  return (
    <main>
      <div className="iss__pageContent">
        {
          user
            ? <Routes>
              {
                routes.map(({ path, element, exact }) =>
                  <Route key={path} path={path} element={element} exact={exact}/>
                )
              }
            </Routes>
            : <Routes>
              <Route path='*' element={<Login />} />
              <Route path='/registration' element={<Registration />} />
            </Routes>
        }
      </div>
    </main>
  );
}
