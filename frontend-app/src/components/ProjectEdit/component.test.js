import { fireEvent, render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AlertContext } from '../../context/Alert';
import ProjectEdit from '.';
import { prepared_attributes } from '../../config/mock_data';

jest.mock("../../config/api", () => ({
  api: { request: _ => {}, },
}));

afterEach(() => {
  jest.restoreAllMocks();
});


test("project edit component test", async () => {
  var throwAlert = false;
  var tryDelete = async (value ) => {
    fireEvent.click(screen.getByRole('button', { name: 'DELETE PROJECT' }));
    fireEvent.input(screen.getByPlaceholderText("Exact Project name"), {target: {value}});
    fireEvent.click(screen.getByRole("button", {name: "submit"}));
  }
  const component = () => (
    <MemoryRouter>
      <AlertContext.Provider value={{addAlert: () => throwAlert = true}}>
        <ProjectEdit
          attributes={prepared_attributes}
          projectName={'project name'}
          projectDescription={'project description'}
          pathID={123}
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
  screen.getByText(/Are you sure you want to delete/);
  expect(screen.queryByRole('button', { name: 'DELETE PROJECT' })).toBeNull();

  fireEvent.click(screen.queryByRole('button', { name: 'cancel' }));
  expect(screen.queryByText(/Are you sure you want to delete/)).toBeNull();
  screen.getByRole('button', { name: 'DELETE PROJECT' });

  expect(container.querySelector(".iss__projectEdit__visibilityLink").href)
    .toBe("http://localhost/projects/123/visibility");

  await tryDelete("some");
  expect(throwAlert).toBeTruthy();
  expect(screen.queryByText(/Are you sure you want to delete/)).toBeNull();
  // TODO: resolve warning
  await tryDelete("project name");
});
