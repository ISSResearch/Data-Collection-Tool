import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from "../../context/User";
import Home from '../../pages/Home';
import Projects from '../../pages/Projects';

test("home page test", () => {
  render(
    <UserContext.Provider value={{ user: { is_superuser: false } }}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path={'/'} element={<Home/>} exact={true} />
          <Route path={'projects/'} element={<Projects/>} exact={true} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );

  screen.getByText('Projects');
})