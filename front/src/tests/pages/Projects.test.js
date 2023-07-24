import { render, screen, renderHook, act } from '@testing-library/react';
import { UserContext } from "../../context/User";
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mock_raw_project  } from '../_mock';
import Projects from '../../pages/Projects';
import api from '../../config/api';
jest.mock('../../config/api');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectID: '1' })
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test("projects page test", async () => {
  const { result: userHook } = renderHook(() => useState(null));

  api.get.mockResolvedValue({data: [mock_raw_project]});

  let rerender = null;
  await act(async () => {
    rerender = render(
      <UserContext.Provider value={{ user: userHook.current[0], setUser: userHook.current[1] }}>
        <MemoryRouter initialEntries={['/project/1']}>
          <Projects />
        </MemoryRouter>
      </UserContext.Provider>
    ).rerender;
  });

  expect(screen.getAllByRole('radio')).toHaveLength(1);

  act(() => userHook.current[1]({is_superuser: true, user_role: 'a'}));

  rerender(
    <UserContext.Provider value={{ user: userHook.current[0], setUser: userHook.current[1] }}>
      <MemoryRouter initialEntries={['/project/1']}>
        <Projects />
      </MemoryRouter>
    </UserContext.Provider>
  );

  expect(screen.getAllByRole('radio')).toHaveLength(2);

  screen.getByRole('group');
});