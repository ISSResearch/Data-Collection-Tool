import { fireEvent, render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AlertContext } from '../../context/Alert';
import ProjectEdit from '.';
import { prepared_attributes } from '../../config/mock_data';

jest.mock('../../config/api');
afterEach(() => {
  jest.restoreAllMocks();
});

test("project edit component test", async () => {
  const component = () => (
    <MemoryRouter>
      <AlertContext.Provider value={{}}>
        <ProjectEdit
          attributes={prepared_attributes}
          projectName={'project name'}
          projectDescription={'project description'}
        />
      </AlertContext.Provider>
    </MemoryRouter>
  );

  const { rerender, container } = render(component());

  expect(screen.queryByText(/Are you sure you want to delete/)).toBeNull();
  screen.getByRole('button', { name: 'DELETE PROJECT' });
  expect(screen.getAllByRole('group')).toHaveLength(4);
  screen.getByText('Submit edit');
  expect(screen.queryByTestId('load-c')).toBeNull();
  expect(screen.getByPlaceholderText("Enter project name").value)
    .toBe("project name");
  expect(screen.getByPlaceholderText("Enter project description").value)
    .toBe("project description");

  fireEvent.click(screen.getByRole('button', { name: 'DELETE PROJECT' }));
  screen.queryByText(/Are you sure you want to delete/);
  expect(screen.queryByRole('button', { name: 'DELETE PROJECT' })).toBeNull();

  fireEvent.click(screen.queryByRole('button', { name: 'cancel' }));
  expect(screen.queryByText(/Are you sure you want to delete/)).toBeNull();
  screen.getByRole('button', { name: 'DELETE PROJECT' });
});
