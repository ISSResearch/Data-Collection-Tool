import { formUID } from '../utils';

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
  * @returns {void}
  */
  disable() { this.active = false; }
}
