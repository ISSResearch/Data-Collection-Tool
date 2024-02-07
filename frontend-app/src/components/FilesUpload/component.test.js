import { render, fireEvent, screen } from '@testing-library/react';
import FilesUpload from '.';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AlertContext } from '../../context/Alert';
import { prepared_attributes } from "../../config/mock_data";

jest.mock("../../hooks/fileInput", () => {
  return () => ({
    files: {},
    handleUpload: {},
    count: () => 1,
    validate: () => ({ isValid: true }),
    gatherFiles: () => []
  })
});
afterEach(() => {
  jest.restoreAllMocks();
});

test("files upload component test", () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element:  <AlertContext.Provider value={{addAlert: () => {}}}>
        <FilesUpload attributes={prepared_attributes} />
      </AlertContext.Provider>
    }
  ]);
  const { container } = render(<RouterProvider router={router}/>);

  expect(screen.queryByTestId('load-c')).toBeNull();

  expect(container.querySelector(".iss__uploadProgress__modal")).toBeNull();
  fireEvent.submit(container.querySelector(".iss__fileInput"));
  expect(container.querySelector(".iss__uploadProgress__modal")).not.toBeNull();
});
