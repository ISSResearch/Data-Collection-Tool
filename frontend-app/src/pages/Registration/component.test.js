import { render, screen, renderHook } from '@testing-library/react';
import { UserContext } from "../../context/User";
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AlertContext } from '../../context/Alert';
import Registration from '.';

test("login page test", () => {
  const { result: userHook } = renderHook(() => useState(null));

  render(
    <MemoryRouter>
      <AlertContext.Provider value={{addAlert: () => {}}}>
      <UserContext.Provider value={{ user: userHook.current[0], setUser: userHook.current[1] }}>
        <Registration/>
      </UserContext.Provider>
      </AlertContext.Provider>
    </MemoryRouter>
  );

  screen.getByText("Registration Page");
  // TODO: resolve same issue as in login
});
