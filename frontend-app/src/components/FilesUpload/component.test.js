import { render, fireEvent, screen } from '@testing-library/react';
import FilesUpload from '.';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AlertContext } from '../../context/Alert';
import { prepared_attributes } from "../../config/mock_data";

jest.mock("../../hooks/fileInput", () =>({
  ..."../../hooks/fileInput",
  validate: () => ({isValid: true})
}));

test("files upload component test", () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element:  <AlertContext.Provider value={{addAlert: () => {}}}>
        <FilesUpload attributes={prepared_attributes} />
      </AlertContext.Provider>
    }
  ]);
  const { rerender, contaier } = render(<RouterProvider router={router}/>);

  expect(screen.queryByTestId('load-c')).toBeNull();

  screen.getByRole()
  // fireEvent.submit(contaier "")
});
