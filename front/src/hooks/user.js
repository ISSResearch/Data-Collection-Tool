import { useState } from "react";
import { deepCopy } from "../utils/utils";
import { routes } from '../config/routes';

export default function useUser() {
  const [user, setUser] = useState(null);

  function initUser(userData) {
    if (!userData) return setUser(null);
    userData.availableRoutes = userData.is_superuser
      ? routes
      : deepCopy(routes).reduce((acc, route) => {
        const { children } = route;
          if (children) route.children = children.filter(({ permission }) => {
            return userData.permissions.includes(permission);
          });
          acc.push(route);
          return acc;
      }, []);
    setUser(userData);
  }

  return { user, initUser };
}
