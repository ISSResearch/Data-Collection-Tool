import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavLinks } from '.';

test("nav links component test", () => {
  const mockLinks = [
    { text: 'Login', link: '/login' },
    { text: 'Registration', link: '/registration' },
  ];
  render(
    <MemoryRouter>
      <NavLinks links={mockLinks}/>
    </MemoryRouter>
  );

  expect(screen.getAllByRole('listitem')).toHaveLength(mockLinks.length);

  mockLinks.forEach(({ text, link }) => {
    const item = screen.getByRole('link', { name: text });

    expect(item.href).toBe('http://localhost' + link);
    expect(item.innerHTML).toBe(text);
  })
});
