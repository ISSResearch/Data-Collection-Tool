import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectEdit from '../../components/ProjectEdit';
import { mock_prepared_attributes } from '../_mock';

test("project edit component test", () => {
  render(
    <MemoryRouter>
      <ProjectEdit
        attributes={mock_prepared_attributes}
        projectName={'project name'}
        projectDescription={'project description'}
      />
    </MemoryRouter>
  );

  expect(screen.queryByText(/Are you sure you want to delete/)).toBeNull();
  screen.getByRole('button', { name: 'DELETE PROJECT' });
  expect(screen.getAllByRole('group')).toHaveLength(4);
  screen.getByText('Submit edit');
  expect(screen.queryByTestId('load-c')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'DELETE PROJECT' }));

  screen.queryByText(/Are you sure you want to delete/);
  expect(screen.queryByRole('button', { name: 'DELETE PROJECT' })).toBeNull();

  fireEvent.click(screen.queryByRole('button', { name: 'cancel' }));
  expect(screen.queryByText(/Are you sure you want to delete/)).toBeNull();
  screen.getByRole('button', { name: 'DELETE PROJECT' });

  fireEvent.click(screen.getByRole('button', { name: 'Submit edit' }));
  expect(screen.queryByText('Submit edit')).toBeNull();
  expect(screen.queryByTestId('load-c')).not.toBeNull();
});