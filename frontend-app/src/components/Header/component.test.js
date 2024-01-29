import { renderHook, render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from "../../context/User";
import { AlertContext } from '../../context/Alert';
import { useState } from "react";
import Header from '.';

test("header component test", () => {
  const { result: hookItem } = renderHook(() => {
    const [user, setUser] = useState(null);
    return { user, setUser };
  });

  const component = () => (
    <MemoryRouter>
      <UserContext.Provider
        value={{ user: hookItem.current.user, setUser: hookItem.current.setUser }}
      >
        <AlertContext.Provider value={{addAlert: () => {}}}>
          <Header/>
        </AlertContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>
  );
  const { rerender } = render(component());

  screen.getByRole("link", { name: "Login"});
  expect(screen.queryByRole("button", { name: "Logout"})).toBeNull();

  act(() => hookItem.current.setUser(true));

  rerender(component());

  expect(screen.queryByRole('link', { name: 'Login'})).toBeNull();
  expect(screen.queryByRole('button', { name: 'Logout'})).not.toBeNull();
});
