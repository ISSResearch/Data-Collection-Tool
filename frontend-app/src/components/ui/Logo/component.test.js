import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Logo from '../../../components/common/Logo';

test("logo component test", () => {
  render(
    <MemoryRouter>
      <Logo/>
    </MemoryRouter>
  );

  expect(screen.getByRole('link').href).toBe("http://localhost/");
});