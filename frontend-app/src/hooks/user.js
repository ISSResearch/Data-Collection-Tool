import { useState } from "react";

/**
* @returns {{ user: null|object, initUser: Function }}
*/
export default function useUser() {
  const [user, setUser] = useState(null);

  /**
  * @param {object} userData
  * @returns {undefined}
  */
  function initUser(userData) { setUser(userData || null); }

  return { user, initUser };
}
