import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider, useDispatch, } from 'react-redux';
import createStore from "../../store";
import Header from '.';
import { setUser } from '../../slices/users';

test("header component test", () => {
  const component = (u) => {
    const Inner = () => {
      const dis = useDispatch();
      dis(setUser(u && {username: "username"}));
      return <MemoryRouter>
        <Header/>
      </MemoryRouter>;
    };
    return <Provider store={createStore()}>
      <Inner/>
    </Provider>;
  };
  const { container, rerender } = render(component());

  expect(container.querySelector(".iss__header__user")).toBeNull();
  expect(screen.queryByText("username")).toBeNull();

  rerender(component(1));

  expect(screen.queryByRole('link', { name: 'Login'})).toBeNull();
  expect(container.querySelector(".iss__header__user")).not.toBeNull();
  expect(screen.queryByRole('button', { name: 'Logout'})).not.toBeNull();
  screen.getByText("username");

  fireEvent.click(screen.queryByRole('button', { name: 'Logout'}));
  expect(container.querySelector(".iss__header__user")).toBeNull();
  expect(screen.queryByText("username")).toBeNull();
});
