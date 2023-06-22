import { render, screen, renderHook } from '@testing-library/react';
import { UserContext } from "../../context/User";
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import ProjectPage from '../../pages/ProjectPage';

test("login page test", () => {
  const { result: userHook } = renderHook(() => useState(null))

  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user: userHook.current[0], setUser: userHook.current[1] }}>
        <ProjectPage/>
      </UserContext.Provider>
    </MemoryRouter>
  );

  // TODO
});