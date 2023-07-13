import axios from 'axios';
import { getOriginDomain } from '../utils/utils';

const api = axios.create({
  baseURL: getOriginDomain() + ':8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken"
});

export default api;
