import { useState } from "react";
import { api } from "../config/api";

export default function useAuthModal(modalId, successCallback) {
  const [modalLoading, setLoading] = useState(false);
  const [modalErrors, setErrors] = useState(null);

  const FIELD_SET = [
    { label: 'Enter username:', type: 'text', name: 'username', placeholder: 'username', required: true },
    { label: 'Enter password:', type: 'password', name: 'password', placeholder: 'password', required: true },
  ];

  async function checkAuth() {
    try {
      var token = localStorage.getItem("dtcAccess");
      await api.get('/api/users/check/', { headers: { "Authorization": "Bearer " + token } });
    }
    catch({ message, response }) {
      var authFailed = response && (response.status === 401 || response.status === 403);
      if (authFailed) window[modalId].showModal();
      var error = new Error(message);
      error.authFailed = authFailed;
      throw error;
    }
  }

  function closeModal() {
    window[modalId].close();
  }

  async function handleAuth(event) {
    event.preventDefault();
    setLoading(true);
    var [name, pass] = event.target;

    try {
      var { data, status } = await api.request('/api/users/login/', {
        method: 'post',
        data: { username: name.value, password: pass.value },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (!data.isAuth || status !== 200) throw new Error(data.message);

      var { accessToken } = data;
      localStorage.setItem("dtcAccess", accessToken);

      closeModal();
      successCallback();
    }
    catch ({ message }) {
      setErrors(message);
      setTimeout(() => setErrors(null), 5000);
    }
    setLoading(false);
  }

  return {
    checkAuth,
    modalErrors,
    modalLoading,
    handleAuth,
    modalFields: FIELD_SET
  };
}
