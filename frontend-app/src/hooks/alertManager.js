import { useState } from "react";
import { formUID } from "../utils";

export default function useAlerts() {
  const [alerts, setAlerts] = useState({});

  function addAlert(message, type, noSession=false) {
    var newID = formUID();
    var newAlert = noSession
      ? { message: "Session expired", type: "common", active: true }
      : { message, type, active: true };

    setAlerts(prev => {
      return { ...prev, [newID]:  newAlert}
    });
  }

  function removeAlert(id) {
    setAlerts(prev => {
      var newAlerts = { ...prev };
      newAlerts[id].active = false;
      return newAlerts;
    })
  }

  return { alerts, addAlert, removeAlert };
}
