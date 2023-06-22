import { render, screen, renderHook } from '@testing-library/react';
import { UserContext } from "../../context/User";
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/Login';

test("login page test", () => {
  const { result: userHook } = renderHook(() => useState(null))

  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user: userHook.current[0], setUser: userHook.current[1] }}>
        <Login/>
      </UserContext.Provider>
    </MemoryRouter>
  );

  screen.getByRole('heading');
  screen.getByRole('button');
});