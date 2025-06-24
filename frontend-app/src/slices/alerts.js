import { createSlice } from '@reduxjs/toolkit';
import { formUID } from '../utils';

/**
* @param {object} state
* @param {object} value
* @param {{ message: string, type: string, noSession: boolean }} value.payload
* @returns {void}
*/
function add(state, { payload }) {
  var { message, type, noSession } = payload;
  var alert = {
    id: formUID(),
    message: noSession ? "Session expired" : message,
    type: noSession ? "common" : type,
  };
  state.activeAlerts[alert.id] =  alert;
}

/**
* @param {object} state
* @param {object} value
* @param {number} value.payload
* @returns {void}
*/
function remove(state, { payload: id }) {
  var alert = state.activeAlerts[id];
  delete state.activeAlerts[id];
  state.recentAlerts[id] = alert;
}

/** @type {object} */
export const alertSlice = createSlice({
  name: 'alerts',
  initialState: {
    activeAlerts: {},
    recentAlerts: {}
  },
  reducers: { addAlert: add, removeAlert: remove }
});

export const { addAlert, removeAlert } = alertSlice.actions;

export default alertSlice.reducer;
