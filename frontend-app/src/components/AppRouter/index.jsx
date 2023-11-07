import { Route, Routes } from "react-router-dom";
import { useContext } from "react";
import { routes } from '../../config/routes';
import { UserContext } from "../../context/User";
import Login from "../../pages/Login";
import Registration from "../../pages/Registration";

export default function() {
  const { user } = useContext(UserContext);

  return (
    <main>
      <div className="iss__pageContent">
        {
          user
          ? <Routes>
              {
                routes.map(({ path, element, exact, children }) =>
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
