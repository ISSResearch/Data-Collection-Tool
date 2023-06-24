import { fireEvent, act, render, screen, renderHook } from '@testing-library/react';
import { UserContext } from "../../context/User";
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mock_raw_project } from '../_mock';
import axios from 'axios';
import ProjectPage from '../../pages/ProjectPage';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectID: '1' })
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test("project page test", async () => {
  const { result: userHook } = renderHook(() => useState(null));

  const options = [
    { name: 'upload data', value: 'upload' },
    { name: 'validate data', value: 'validate' },
    { name: 'download data', value: 'download' },
    { name: 'statistics', value: 'stats' },
  ];

  axios.get.mockResolvedValue({data: mock_raw_project});

  let rerender = null;
  await act(async () => {
    rerender = render(
      <UserContext.Provider value={{ user: userHook.current[0], setUser: userHook.current[1] }}>
        <MemoryRouter initialEntries={['/project/1']}>
          <ProjectPage />
        </MemoryRouter>
      </UserContext.Provider>
    ).rerender;
  });

  expect(screen.queryByTestId('load-c')).toBeNull();
  screen.getByText(mock_raw_project.name);
  screen.getByText('Description: ' + mock_raw_project.description);

  expect(screen.getAllByRole('radio')).toHaveLength(1);

  act(() => userHook.current[1]({is_superuser: true, user_role: 'a'}));

  rerender(
    <UserContext.Provider value={{ user: userHook.current[0], setUser: userHook.current[1] }}>
      <MemoryRouter initialEntries={['/project/1']}>
        <ProjectPage />
      </MemoryRouter>
    </UserContext.Provider>
  );

  expect(screen.getAllByRole('radio')).toHaveLength(options.length + 1);

  fireEvent.click(screen.getByRole('radio', { name: 'download data' }));

  screen.getByRole('heading', { level: 2 });

  fireEvent.click(screen.getByRole('radio', { name: 'editing' }));

  expect(screen.queryByText('Description: ' + mock_raw_project.description)).toBeNull();
});