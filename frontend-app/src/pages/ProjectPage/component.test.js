import { act, render, screen } from '@testing-library/react';
import { UserContext } from "../../context/User";
import { MemoryRouter } from 'react-router-dom';
import { AlertContext } from '../../context/Alert';
import { raw_project } from '../../config/mock_data';
import { api } from '../../config/api';
import ProjectPage from '.';

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
  const component = (admin) =>
    <UserContext.Provider value={{ user: { is_superuser: admin } }}>
    <AlertContext.Provider value={{addAlert: () => {}}}>
      <MemoryRouter initialEntries={['/projects/1']}>
        <ProjectPage />
      </MemoryRouter>
    </AlertContext.Provider>
    </UserContext.Provider>;

  api.get.mockResolvedValue({ data: raw_project });

  var unmount = null;

  await act(async () => unmount = render(component()).unmount);

  expect(screen.queryByTestId('load-c')).toBeNull();
  expect(screen.getByText(/Description/).innerHTML.split('<br>').slice(1).join("<br>"))
    .toBe(raw_project.description);

  expect(screen.getByRole('navigation').children[0].children).toHaveLength(0);

  unmount();

  await act(async () => render(component(true)));

  expect(screen.getByRole('navigation').children[0].children).toHaveLength(options.length + 1);
});
