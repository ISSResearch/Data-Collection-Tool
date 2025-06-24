import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import createStore from "../../store";
import FilesUpload from '.';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { prepared_attributes } from "../../config/mock_data";

jest.mock("../../hooks/fileInput", () => {
  return () => ({
    files: {},
    handleUpload: {},
    count: () => 1,
    validate: () => ({ isValid: true }),
    gatherFiles: () => []
  });
});
afterEach(() => {
  jest.restoreAllMocks();
});

test("files upload component test", () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element:  <Provider store={createStore()}>
        <FilesUpload attributes={prepared_attributes} />
      </Provider>
    }
  ]);
  const { container } = render(<RouterProvider router={router}/>);

  expect(screen.queryByTestId('load-c')).toBeNull();

  expect(container.querySelector(".iss__uploadProgress__modal")).toBeNull();
  fireEvent.submit(container.querySelector(".iss__fileInput"));
  expect(container.querySelector(".iss__uploadProgress__modal")).not.toBeNull();
});
