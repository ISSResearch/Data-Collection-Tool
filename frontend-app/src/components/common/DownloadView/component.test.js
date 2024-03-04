import { render, screen, act } from '@testing-library/react';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import DownloadView from '.';
import { AlertContext } from '../../../context/Alert';

jest.mock("../../../config/api", () => {
  var get = (r) => {
    var pathSplit = r.split("/");
    var task = pathSplit[pathSplit.length - 2];
    if (task === "temp_token") return;
    return {
      data: task !== "temp_token"
      ? { archive_id: "arch_id_123", status: task }
      : { token: null }
    };
  };
  return { fileApi: { get } };
});
afterEach(() => {
  jest.restoreAllMocks();
});

test("download view component test", async () => {
  const router = (task) => createBrowserRouter([
    {
      path: "/",
      element: <AlertContext.Provider value={{addAlert: () => {}}}>
        <DownloadView taskID={task} />
      </AlertContext.Provider>,
    }
  ]);

  const init = async (task) => {
    return await act(async () => {
      const { container, unmount } = await render(<RouterProvider router={router(task)} />);
      return { container, unmount };
    });
  };

  var { unmount } = await init("PENDING");
  expect(screen.getByText("PENDING").className).toBe("iss__downloadingView__title__id");
  screen.getByText("getting data...");
  screen.getByText(/The DataSet is preparing. The download will start soon.../);
  unmount();

  await init("FAILURE");
  screen.getByText("FAILURE");
  screen.getByText("Error occured while gathering the DataSet. Please request a new one.");
  unmount();

  await init("SUCCESS");
  screen.getByText("SUCCESS");
  screen.getByText("DataSet is ready. Downloading...");
  screen.getByText("Download started...");
});
