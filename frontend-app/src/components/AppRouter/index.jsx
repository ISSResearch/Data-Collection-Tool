import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ReactElement, useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/User";

/** @type {string[]} */
const SAFE_ROUTES = ["/login", "/registration"];

/** @returns {ReactElement} */
export default function AppRouter() {
  const [redirect, setRedirect] = useState(false);
  const { user } = useContext(UserContext);
  const location = useLocation();

  useEffect(() => {
    setRedirect(!user && !SAFE_ROUTES.includes(location.pathname));
  }, [location]);

  return (
    <main>
      <div className="iss__pageContent">
        { redirect ? <Navigate to="/login" replace={true} /> : <Outlet /> }
      </div>
    </main>
  );
}
