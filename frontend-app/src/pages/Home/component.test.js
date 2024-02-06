import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from "../../context/User";
import { AlertContext } from '../../context/Alert';
import Home from '.';
import Projects from '../Projects';

test("home page test", () => {
  render(
    <UserContext.Provider value={{ user: { is_superuser: false } }}>
    <AlertContext.Provider value={{addAlert: () => {}}}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path={'/'} element={<Home/>} exact={true} />
          <Route path={'projects/'} element={<Projects/>} exact={true} />
        </Routes>
      </MemoryRouter>
    </AlertContext.Provider>
    </UserContext.Provider>
  );

  screen.getByText('Projects');
})
