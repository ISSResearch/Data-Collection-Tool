import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/User";

const SAFE_ROUTES = ["/login", "/registration"];

export default function() {
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
