import { render, screen, act } from '@testing-library/react';
import { Provider, useSelector, useDispatch } from "react-redux";
import createStore from "../../store";
import { setUser } from '../../slices/users';
import { MemoryRouter } from 'react-router-dom';
import { raw_project } from '../../config/mock_data';
import Projects from '.';
import { api } from '../../config/api';
import { useEffect } from 'react';

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
  var nav;

  api.get.mockResolvedValue({ data: [] });
  const Inner = ({u}) => {
    const _nav  = useSelector((s) => s.head.nav);
    const dispatch = useDispatch();
    useEffect(() => {
      nav = _nav;
    }, [_nav]);
    useEffect(() => {
      u && dispatch(setUser({is_superuser: true}));
    }, []);
    return <MemoryRouter initialEntries={['projects/']}>
      <Projects />
    </MemoryRouter>;
  };
  await act(async () => {
    unmount = render(
      <Provider store={createStore()}>
        <Inner />
      </Provider>
    ).unmount;
  });

  expect(nav || 0).toHaveLength(1);
  screen.getByText("No projects.");

  unmount();

  api.get.mockResolvedValue({ data: [raw_project] });
  await act(async () => await render(
    <Provider store={createStore()}>
      <Inner u/>
    </Provider>
  ));

  expect(nav).toHaveLength(2);
  expect(screen.queryByText("No projects.")).toBeNull();
});
