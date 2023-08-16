import { renderHook, render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from "../../context/User";
import { useState } from "react";
import Header from '../../components/Header';

test("header component test", () => {
  const { result: hookItem } = renderHook(() => {
    const [user, setUser] = useState(null);
    return { user, setUser };
  });

  const { rerender } = render(
    <MemoryRouter>
      <UserContext.Provider
        value={{ user: hookItem.current.user, setUser: hookItem.current.setUser }}
      >
        <Header/>
      </UserContext.Provider>
    </MemoryRouter>
  );

  screen.getByRole('link', { name: 'Login'});
  expect(screen.queryByRole('button', { name: 'Logout'})).toBeNull();

  act(() => hookItem.current.setUser(true));

  rerender(
    <MemoryRouter>
      <UserContext.Provider
        value={{ user: hookItem.current.user, setUser: hookItem.current.setUser }}
      >
        <Header/>
      </UserContext.Provider>
    </MemoryRouter>
  );

  expect(screen.queryByRole('link', { name: 'Login'})).toBeNull();
  expect(screen.queryByRole('button', { name: 'Logout'})).not.toBeNull();
});