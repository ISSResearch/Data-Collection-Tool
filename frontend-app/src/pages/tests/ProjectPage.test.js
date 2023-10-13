import { act, render, screen } from '@testing-library/react';
import { UserContext } from "../../context/User";
import { MemoryRouter } from 'react-router-dom';
import { mock_raw_project } from '../_mock';
import { api } from '../../config/api';
import ProjectPage from '../../pages/ProjectPage';

jest.mock('../../config/api');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectID: '1' })
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test("project page test", async () => {
  const options = [
    { name: 'upload data', value: 'upload' },
    { name: 'validate data', value: 'validate' },
    { name: 'download data', value: 'download' },
    { name: 'statistics', value: 'stats' },
  ];

  api.get.mockResolvedValue({ data: mock_raw_project });

  let unmount = null;

  await act(async () => {
    unmount = render(
      <UserContext.Provider value={{ user: { is_superuser: false } }}>
        <MemoryRouter initialEntries={['/projects/1']}>
          <ProjectPage />
        </MemoryRouter>
      </UserContext.Provider>
    ).unmount;
  });

  expect(screen.queryByTestId('load-c')).toBeNull();
  expect(screen.getByText(/Description/).innerHTML.split('<br>')[1])
    .toBe(mock_raw_project.description);

  expect(screen.getByRole('navigation').children[0].children).toHaveLength(2);

  unmount();

  await act(async () => {
    render(
      <UserContext.Provider value={{ user: { is_superuser: true } }}>
        <MemoryRouter initialEntries={['/projects/1']}>
          <ProjectPage />
        </MemoryRouter>
      </UserContext.Provider>
    );
  });

  expect(screen.getByRole('navigation').children[0].children).toHaveLength(options.length + 1);
});
