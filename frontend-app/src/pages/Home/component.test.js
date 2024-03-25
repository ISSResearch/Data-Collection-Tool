import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import createStore from "../../store";
import Home from '.';
import Projects from '../Projects';

test("home page test", () => {
  const { container } = render(
    <Provider store={createStore()}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path={'/'} element={<Home/>} exact={true} />
          <Route path={'projects/'} element={<Projects/>} exact={true} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  expect(container.querySelector(".iss__projects")).not.toBeNull();
});
