import { Route, Routes } from "react-router-dom";
import { UserContext } from "../context/User";
import { useContext, useEffect, useState } from "react";
import { routes } from '../config/routes';
import { deepCopy } from "../utils/utils";
import Login from "../pages/Login";
import Registration from "../pages/Registration";

export default function AppRouter() {
  const { user } = useContext(UserContext);
  const [availableRoutes, setAvailableRoutes] = useState([]);

  useEffect(() => {
    if (!user) return;
    if (user.is_superuser) setAvailableRoutes(routes);
    else {
      const publicRoutes = deepCopy(routes).reduce((acc, route) => {
        const { children, secure } = route;
        if (children) route.children = children.filter(({secure}) => !secure);
        if (!secure) acc.push(route);
        return acc;
      }, []);
      setAvailableRoutes(publicRoutes);
    }

  }, [user]);

  return (
    <main>
      <div className="iss__pageContent">
        {
          user
          ? <Routes>
              {
                availableRoutes.map(({ path, element, exact, children }) =>
                  <Route
                    key={path}
                    path={path}
                    element={element}
                    exact={exact}
                  >
                    {
                      children?.map(({ path, element, exact}) =>
                        <Route key={path} path={path} element={element} exact={exact}/>
                      )
                    }
                  </Route>
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
// TODO: changes - revise tests