import axios from 'axios';
import { getOriginDomain } from '../utils/utils';

const port = process.env.REACT_APP_BACKEND_PORT;

const api = axios.create({
  baseURL: `${getOriginDomain()}:${port || 8000}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken"
});

export default api;
