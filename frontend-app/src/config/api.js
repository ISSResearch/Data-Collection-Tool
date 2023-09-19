import axios from 'axios';
import { getOriginDomain } from '../utils/utils';

const origin = process.env.REACT_APP_CASE === 'test'
  ? 'http://iss-test-back'
  : getOriginDomain();

const storageOrigin = "http://127.0.0.1"

const api = axios.create({
  baseURL: `${origin}:8000`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken"
});

const fileApi = axios.create({
  baseURL: `${storageOrigin}:9000`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken"
});

export { api, fileApi };
