import { render, screen, renderHook } from '@testing-library/react';
import { UserContext } from "../../context/User";
import { useState } from "react";
import { MemoryRouter } from 'react-router-dom';
import AppRouter from '../../components/AppRouter';

test("app router component test", () => {
  const { result: hookItem } = renderHook(() => {
    const [user, setUser] = useState(null);
    return { user, setUser };
  });

  render(
    <MemoryRouter>
      <UserContext.Provider
        value={{ user: hookItem.current.user, setUser: hookItem.current.setUser }}
      >
        <AppRouter/>
      </UserContext.Provider>
    </MemoryRouter>
  );

  // TODO: how to test routes
});