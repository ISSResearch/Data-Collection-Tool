import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";

/** @type {string[]} */
const SAFE_ROUTES = ["/login", "/registration"];

/** @returns {ReactElement} */
export default function AppRouter() {
  const [redirect, setRedirect] = useState(false);
  const user = useSelector((state) => state.user);
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
