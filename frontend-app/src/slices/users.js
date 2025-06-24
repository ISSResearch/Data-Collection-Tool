import { createSlice } from '@reduxjs/toolkit';

/**
* @param {{ user: object | null}} state
* @param {object} value
* @param {object | null} [value.payload]
* @returns {void}
*/
function set(state, { payload }) {
  state.user = payload || null;
}

/** @type {object} */
export const userSlice = createSlice({
  name: 'users',
  initialState: { user: null },
  reducers: { setUser: set }
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
