import { render, screen, act } from '@testing-library/react';
import { UserContext } from "../../context/User";
import { MemoryRouter } from 'react-router-dom';
import { AlertContext } from '../../context/Alert';
import { raw_project } from '../../config/mock_data';
import Projects from '.';
import { api } from '../../config/api';
jest.mock('../../config/api');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectID: '1' })
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test("projects page test", async () => {
  api.get.mockResolvedValue({ data: [raw_project] });
  let unmount = null;

  api.get.mockResolvedValue({ data: [] });
  await act(async () => {
    unmount = render(
      <UserContext.Provider value={{ user: { is_superuser: false } }}>
      <AlertContext.Provider value={{addAlert: () => {}}}>
        <MemoryRouter initialEntries={['/project/1']}>
          <Projects />
        </MemoryRouter>
      </AlertContext.Provider>
      </UserContext.Provider>
    ).unmount;
  });

  expect(screen.getByRole('navigation').children[0].children).toHaveLength(1);
  screen.getByText("No projects.");

  unmount();

  api.get.mockResolvedValue({ data: [raw_project] });
  await act(async () => await render(
    <UserContext.Provider value={{ user: { is_superuser: true } }}>
    <AlertContext.Provider value={{addAlert: () => {}}}>
      <MemoryRouter initialEntries={['/project/1']}>
        <Projects />
      </MemoryRouter>
    </AlertContext.Provider>
    </UserContext.Provider>
  ));

  expect(screen.getByRole('navigation').children[0].children).toHaveLength(2);
  expect(screen.queryByText("No projects.")).toBeNull();
});
