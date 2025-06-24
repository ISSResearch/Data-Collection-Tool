import { render, screen, fireEvent } from '@testing-library/react';
import { Provider, useSelector } from 'react-redux';
import createStore from "../../store";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '.';
import Home from '../Home';
import Projects from '../Projects';
import { useEffect } from 'react';

test("login page test", () => {
  var nav;
  const component = () => {
    const Inner = () => {
      const head = useSelector((s) => s.head);
      useEffect(() => {nav=head;}, [head]);
    };
    return <Provider store={createStore()}>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path={'/'} element={<Home/>} exact={true} />
          <Route path={'/login'} element={<Login/>} exact={true} />
          <Route path={'projects/'} element={<Projects/>} exact={true} />
        </Routes>
        <Inner/>
      </MemoryRouter>
    </Provider>;
  };
  render(component());

  expect(nav.title).toBe("Login");
  expect(nav.nav).toHaveLength(2);

  fireEvent.input(screen.getByPlaceholderText("username"), "some");
  fireEvent.input(screen.getByPlaceholderText("password"), "some");
  // TODO: resolve event inputs issue
  // fireEvent.click(screen.getByRole("button"));
});
