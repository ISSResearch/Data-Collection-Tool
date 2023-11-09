import { useState } from "react";
import { formUID } from "../utils";

export default function useAlerts() {
  const [alerts, setAlerts] = useState({});

  function addAlert(message, type) {
    var newID = formUID();
    setAlerts(prev => {
      return { ...prev, [newID]: { message, type, active: true } }
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
