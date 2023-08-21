import { render, fireEvent, screen } from '@testing-library/react';
import ProjectCreate from '../../components/ProjectCreate';

test("project create component test", () => {
  render(<ProjectCreate />);

  expect(screen.getAllByRole('group')).toHaveLength(2);
  screen.queryByText('Create Project');
  expect(screen.queryByTestId('load-c')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Create Project' }));

  expect(screen.queryByText('Create Project')).toBeNull();
  expect(screen.getByTestId('load-c').className).toBe('iss__loadingMin');
});