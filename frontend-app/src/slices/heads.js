import { createSlice } from '@reduxjs/toolkit';

/**
* @param {{ title: string, nav: Array }} state
* @param {object} value
* @param {string} value.payload
* @returns {void}
*/
function _setTitle(state, { payload }) {
  state.title = payload || "";
}

/**
* @param {{ title: string, nav: Array }} state
* @param {object} value
* @param {Array} value.payload
* @returns {void}
*/
function _setNav(state, { payload }) {
  state.nav = payload || [];
}

/** @type {object} */
export const headSlice = createSlice({
  name: 'head',
  initialState: {
    title: "",
    nav: []
  },
  reducers: { setTitle: _setTitle, setNav: _setNav }
});

export const { setTitle, setNav } = headSlice.actions;

export default headSlice.reducer;
