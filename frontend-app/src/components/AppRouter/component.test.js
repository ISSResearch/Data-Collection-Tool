import { render, screen } from '@testing-library/react';
import { UserContext } from "../../context/User";
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
})

test("app router component without user test", () => {
  render(
    <UserContext.Provider
      value={{ user: false }}
    >
      <MemoryRouter initialEntries={['/projects/1']}>
        <AppRouter/>
      </MemoryRouter>
    </UserContext.Provider>
  );

  expect(screen.queryByText("mock outlet")).toBeNull();
  screen.getByText("mock navigate");
});

test("app router component with user test", () => {
  render(
    <UserContext.Provider
      value={{ user: true }}
    >
      <MemoryRouter initialEntries={['/projects/1']}>
        <AppRouter/>
      </MemoryRouter>
    </UserContext.Provider>
  );

  expect(screen.queryByText("mock navigate")).toBeNull();
  screen.getByText("mock outlet");
});
