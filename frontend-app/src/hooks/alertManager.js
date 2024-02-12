import { useState } from "react";
import { formUID } from "../utils";

/**
* @class
* @property {number} id
* @property {string} message
* @property {string} type
* @property {boolean} active
*/
export class Alert {
  /**
   * @class
   * @param {string} message
   * @param {string} type
   * @param {boolean} noSession
   */
  constructor(message, type, noSession) {
    /** @type {number} */
    this.id = formUID();
    /** @type {string} */
    this.message = noSession ? "Session expired" : message;
    /** @type {string} */
    this.type = noSession ? "common" : type;
    /** @type {boolean} */
    this.active = true;
  }

  /**
  * @returns {undefined}
  */
  disable() { this.active = false; }
}

/**
* @returns {{ alerts: object, addAlert: Function, removeAlert: Function }}
*/
export function useAlerts() {
  const [alerts, setAlerts] = useState({});

  /**
  * @param {string} message
  * @param {string} type
  * @param {boolean} noSession
  * @returns {undefined}
  */
  function addAlert(message, type, noSession=false) {
    var alert = new Alert(message, type, noSession);
    setAlerts((prev) => ({ ...prev, [alert.id]:  alert}));
  }

  /**
  * @param {number} id
  * @returns {undefined}
  */
  function removeAlert(id) {
    setAlerts((prev) => {
      var newAlerts = { ...prev };
      newAlerts[id].disable();
      return newAlerts;
    });
  }

  return { alerts, addAlert, removeAlert };
}
