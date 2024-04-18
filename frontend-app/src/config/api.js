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
const backendPort = process.env.BACKEND_PORT;

/** @type {string} */
const storagePort = process.env.STORAGE_PORT;

/** @type {string} */
const origin = process.env.REACT_APP_CASE === 'test'
  ? 'http://iss-test-back'
  : getOriginDomain();

/** @type {string} */
const storageOrigin = getOriginDomain();

/** @type {Api} */
export const api = axios.create({
  baseURL: `${origin}:${backendPort}`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken"
});

/** @type {Api} */
export const fileApi = axios.create({
  baseURL: `${storageOrigin}:${storagePort}`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken"
});
