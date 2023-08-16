import { act, render, screen, renderHook } from '@testing-library/react';
import { UserContext } from "../../context/User";
import { useState } from "react";
import { MemoryRouter } from 'react-router-dom';
import AppRouter from '../../components/AppRouter';

test("app router component test", () => {
  const { result: hookItem } = renderHook(() => {
    const [user, setUser] = useState(null);
    return { user, setUser };
  });

  const { rerender } = render(
    <UserContext.Provider
      value={{ user: hookItem.current.user, setUser: hookItem.current.setUser }}
    >
      <MemoryRouter initialEntries={['/projects/1']}>
        <AppRouter/>
      </MemoryRouter>
    </UserContext.Provider>
  );

  expect(screen.getByRole('heading').innerHTML).toBe('Login Page');

  act(() => hookItem.current.setUser({ name: 'username' }));

  rerender(
    <UserContext.Provider
      value={{ user: hookItem.current.user, setUser: hookItem.current.setUser }}
    >
      <MemoryRouter initialEntries={['/projects/1']}>
        <AppRouter/>
      </MemoryRouter>
    </UserContext.Provider>
  );

  screen.getByTestId('load-c');
});