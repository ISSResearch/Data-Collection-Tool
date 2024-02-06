import { render, screen, renderHook, fireEvent } from '@testing-library/react';
import { UserContext } from "../../context/User";
import { AlertContext } from '../../context/Alert';
import { useUser } from "../../hooks";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '.';
import Home from '../Home';
import Projects from '../Projects';

test("login page test", () => {
  const { result: userHook } = renderHook(() => useUser(null))

  render(
    <UserContext.Provider value={userHook.current}>
    <AlertContext.Provider value={{addAlert: () => {}}}>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path={'/'} element={<Home/>} exact={true} />
          <Route path={'/login'} element={<Login/>} exact={true} />
          <Route path={'projects/'} element={<Projects/>} exact={true} />
        </Routes>
      </MemoryRouter>
    </AlertContext.Provider>
    </UserContext.Provider>
  );

  screen.getByText("Login Page");

  fireEvent.input(screen.getByPlaceholderText("username"), "some");
  fireEvent.input(screen.getByPlaceholderText("password"), "some");
  // TODO: resolve event inputs issue
  // fireEvent.click(screen.getByRole("button"));
});
