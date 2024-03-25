import { render } from '@testing-library/react';
import { Provider, useSelector } from "react-redux";
import createStore from "../../store";
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Registration from '.';

test("login page test", () => {
  var nav;
  const component = () => {
    const Inner = () => {
      const head = useSelector((s) => s.head);
      useEffect(() => {nav = head;}, [head]);
      return <></>;
    };
    return <Provider store={createStore()}>
      <MemoryRouter>
        <Registration/>
        <Inner/>
      </MemoryRouter>
    </Provider>;
  };
  render(component());

  expect(nav.title).toBe("Registration");
  expect(nav.nav).toHaveLength(2);
  // TODO: resolve same issue as in login
});
