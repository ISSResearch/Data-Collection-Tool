import { act, render, screen } from '@testing-library/react';
import createStore from "../../store";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { raw_project } from '../../config/mock_data';
import { api } from '../../config/api';
import ProjectPage from '.';
import { useEffect } from 'react';
import { setUser } from '../../slices/users';

jest.mock('../../config/api');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectID: '1' })
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test("project page test", async () => {
  var nav;
  const options = [
    { name: "upload data", value: "upload" },
    { name: "validate data", value: "validate" },
    { name: "download data", value: "download" },
    { name: "goals", value: "goals" },
    { name: "statistics", value: "stats" },
  ];
  const component = (admin) => {
    const Inner = () => {
      const dispatch = useDispatch();
      const _nav = useSelector((s) => s.head.nav);
      dispatch(setUser({is_superuser: admin}));
      useEffect(() => {nav=_nav;}, [_nav]);
      return <MemoryRouter initialEntries={['/projects/1']}>
        <ProjectPage />
      </MemoryRouter>;
    };
    return <Provider store={createStore()}>
      <Inner/>
    </Provider>;
  };

  api.get.mockResolvedValue({ data: raw_project });

  var unmount = null;

  await act(async () => unmount = render(component()).unmount);

  expect(screen.queryByTestId('load-c')).toBeNull();
  expect(screen.getByText(/Description/).innerHTML.split('<br>').slice(1).join("<br>"))
    .toBe(raw_project.description);

  expect(nav).toHaveLength(0);

  unmount();

  await act(async () => render(component(true)));

  expect(nav).toHaveLength(options.length + 1);
});
