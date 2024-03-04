import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AllProjects from '.';
import { raw_project } from '../../config/mock_data';

test('all project component test', () => {
  const { rerender } = render(
    <MemoryRouter>
      <AllProjects/>
    </MemoryRouter>
  );
  expect(screen.queryByTestId('load-c')).not.toBeNull();
  expect(screen.queryByTestId('load-c').className).toBe('iss__loading');

  rerender(
    <MemoryRouter>
      <AllProjects items={[raw_project]}/>
    </MemoryRouter>
  );

  expect(screen.queryByTestId('load-c')).toBeNull();
  expect(screen.getByRole('link').href).toBe('http://localhost/projects/' + raw_project.id);
  expect(screen.getByRole('heading').innerHTML).toBe(raw_project.name);

  rerender(
    <MemoryRouter>
      <AllProjects items={[]}/>
    </MemoryRouter>
  );

  expect(screen.queryByTestId('load-c')).toBeNull();
  expect(screen.queryByRole('link')).toBeNull();
  expect(screen.queryByRole('heading')).toBeNull();
  expect(screen.getByText('No projects.'));
});
