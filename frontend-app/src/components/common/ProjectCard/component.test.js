import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectCard from '.';

test("project card component test", () => {
  const mockItem = {
    id: '1',
    name: 'Test Project',
    description: 'project description' ,
    created_at: '11-01-2000'
  };
  render(
    <MemoryRouter>
      <ProjectCard item={mockItem}/>
    </MemoryRouter>
  );

  expect(screen.getByRole('link').href).toBe('http://localhost/projects/' + mockItem.id);
  expect(screen.queryByText(mockItem.name)).not.toBeNull();
  expect(screen.queryByText(mockItem.description)).not.toBeNull();
  expect(screen.queryByText(mockItem.created_at)).not.toBeNull();
});
