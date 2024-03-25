import { render, screen } from '@testing-library/react';
import { Provider, useDispatch } from 'react-redux';
import createStore from "../../store";
import { setUser } from '../../slices/users';
import { MemoryRouter } from 'react-router-dom';
import AppRouter from '../../components/AppRouter';

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');

  return {
    ...originalModule,
    Outlet: () => "mock outlet",
    Navigate: () => "mock navigate",
  };
});
afterEach(() => {
  jest.restoreAllMocks();
});

test("app router component without user test", () => {
  render(
    <Provider store={createStore()}>
      <MemoryRouter initialEntries={['/projects/1']}>
        <AppRouter/>
      </MemoryRouter>
    </Provider>
  );

  expect(screen.queryByText("mock outlet")).toBeNull();
  screen.getByText("mock navigate");
});

test("app router component with user test", () => {
  const component = () => {
    const Inner = () => {
      const dispatch = useDispatch();
      dispatch(setUser({is_superuser:true}));
      return <MemoryRouter initialEntries={['/projects/1']}>
        <AppRouter/>
      </MemoryRouter>;
    };
    return <Provider store={createStore()}>
      <Inner />
    </Provider>;
  };
  render(component());

  expect(screen.queryByText("mock navigate")).toBeNull();
  screen.getByText("mock outlet");
});
