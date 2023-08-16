import { render, screen, act } from '@testing-library/react';
import { UserContext } from "../../context/User";
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
  api.get.mockResolvedValue({data: [mock_raw_project]});

  let rerender = null;

  await act(async () => {
    rerender = render(
      <UserContext.Provider value={{ user: { is_superuser: false } }}>
        <MemoryRouter initialEntries={['/project/1']}>
          <Projects />
        </MemoryRouter>
      </UserContext.Provider>
    ).rerender;
  });

  expect(screen.getByRole('navigation').children[0].children).toHaveLength(1);

  rerender(
    <UserContext.Provider value={{ user: { is_superuser: true }}}>
      <MemoryRouter initialEntries={['/project/1']}>
        <Projects />
      </MemoryRouter>
    </UserContext.Provider>
  );

  expect(screen.getByRole('navigation').children[0].children).toHaveLength(2);
});