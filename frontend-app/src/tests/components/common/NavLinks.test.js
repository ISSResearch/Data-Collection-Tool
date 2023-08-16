import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavLink from '../../../components/common/NavLinks';

test("nav links component test", () => {
  const mockLinks = [
    { text: 'Login', link: '/login' },
    { text: 'Registration', link: '/registration' },
  ];
  render(
    <MemoryRouter>
      <NavLink links={mockLinks}/>
    </MemoryRouter>
  );

  expect(screen.getAllByRole('listitem')).toHaveLength(mockLinks.length);

  mockLinks.forEach(({ text, link }) => {
    const item = screen.getByRole('link', { name: text });

    expect(item.href).toBe('http://localhost' + link);
    expect(item.innerHTML).toBe(text);
  })
});
