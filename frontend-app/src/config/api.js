import axios from 'axios';
import { getOriginDomain } from '../utils/';

/**
* @typedef {object} Api
* @param {Function} get
* @param {Function} post
* @param {Function} delete
* @param {Function} patch
* @param {Function} request
*/

/** @type {string} */
const backendPort = process.env.REACT_APP_BACKEND_PORT;

/** @type {string} */
const storagePort = process.env.REACT_APP_STORAGE_PORT;

/** @type {string} */
const origin = process.env.REACT_APP_CASE === 'test'
  ? 'http://iss-test-back'
  : getOriginDomain();

/** @type {string} */
const storageOrigin = getOriginDomain();

// TODO: fix env variables
/** @type {Api} */
export const api = axios.create({
  baseURL: `${origin}:${backendPort || 8000}`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken"
});

/** @type {Api} */
export const fileApi = axios.create({
  baseURL: `${storageOrigin}:${storagePort || 9000}`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken"
});
