import axios from 'axios';
import { getOriginDomain } from '../utils/utils';

const origin = process.env.REACT_APP_CASE === 'test'
  ? 'http://iss-test-back'
  : getOriginDomain();

const api = axios.create({
  baseURL: `${origin}:8000`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken"
});

export default api;
