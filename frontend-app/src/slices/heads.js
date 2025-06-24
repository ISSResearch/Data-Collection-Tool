import { createSlice } from '@reduxjs/toolkit';

/** @typedef {{ title: string, nav: Array, current: string, parent: string}} State */
/**
* @param {State} state
* @param {string} type
* @param {Array | string} payload
* @returns {void}
*/
function set(state, type, payload) {
  var defaults = { nav: [], link: false };
  state[type] = payload || defaults[type] || "";
}

/** @type {object} */
export const headSlice = createSlice({
  name: 'head',
  initialState: {
    title: "",
    nav: [],
    current: "",
    parent: "",
    link: false,
  },
  reducers: {
    setTitle: (state, { payload }) => set(state, "title", payload),
    setNav: (state, { payload }) => set(state, "nav", payload),
    setCurrent: (state, { payload }) => set(state, "current", payload),
    setParent: (state, { payload }) => set(state, "parent", payload),
    setLink: (state, { payload }) => set(state, "link", payload),
  }
});

export const { setTitle, setNav, setCurrent, setParent, setLink } = headSlice.actions;

export default headSlice.reducer;
