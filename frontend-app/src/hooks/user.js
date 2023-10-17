import { useState } from "react";

export default function useUser() {
  const [user, setUser] = useState(null);

  function initUser(userData) {
    if (!userData) return setUser(null);
    setUser(userData);
  }

  return { user, initUser };
}
