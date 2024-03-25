import { render, fireEvent, screen } from '@testing-library/react';
import ProjectCreate from '.';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import createStore from "../../store";

test("project create component test", () => {
  render(
    <Provider store={createStore()}>
      <MemoryRouter>
        <ProjectCreate />
      </MemoryRouter>
    </Provider>
  );

  expect(screen.getAllByRole('group')).toHaveLength(2);
  screen.queryByText('Create Project');
  expect(screen.queryByTestId('load-c')).toBeNull();

  fireEvent.input(screen.getByPlaceholderText("Enter project name"), {target: {value: "some"}});
  // TODO: due to synthetic i cant get inout from form - resolve;
  fireEvent.click(screen.getByRole('button', { name: 'Create Project' }));
});
