import { fireEvent, render, screen, } from '@testing-library/react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import ProjectEdit from '.';
import { Provider, useSelector } from 'react-redux';
import createStore from "../../store";
import { prepared_attributes } from '../../config/mock_data';

jest.mock("../../config/api", () => ({
  api: { request: () => {}, },
}));

afterEach(() => {
  jest.restoreAllMocks();
});


test("project edit component test", async () => {
  var alertTrigger;

  var tryDelete = async (value ) => {
    fireEvent.click(screen.getByRole('button', { name: 'DELETE PROJECT' }));
    fireEvent.input(screen.getByPlaceholderText("Exact Project name"), {target: {value}});
    fireEvent.click(screen.getByRole("button", {name: "submit"}));
  };
  const component = () => {
    const Inner = () => {
      const alerts = useSelector((s) => s.alerts.activeAlerts);
      useEffect(() => {
        alertTrigger = Object.keys(alerts).length;
      }, [alerts]);
      return <ProjectEdit
        attributes={prepared_attributes}
        projectName={'project name'}
        projectDescription={'project description'}
        pathID={123}
      />;
    };

    const router = createBrowserRouter([
      {
        path: "/",
        element:  <Provider store={createStore()}>
          <Inner/>
        </Provider>
      }
    ]);
    return  <RouterProvider router={router}/>;
  };

  const { container } = render(component());

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
  expect(alertTrigger).toBeTruthy();
  expect(screen.queryByText(/Are you sure you want to delete/)).toBeNull();
  await tryDelete("project name");
});
