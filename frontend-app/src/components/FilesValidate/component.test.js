import { render, screen, act, fireEvent } from "@testing-library/react";
import FilesValidate from ".";
import { AlertContext } from "../../context/Alert";
import { MemoryRouter } from "react-router-dom";
import { fileApi } from "../../config/api";
import { prepared_attributes, raw_files } from "../../config/mock_data";

jest.mock("../../config/api");
afterEach(() => {
  jest.restoreAllMocks();
});

test("files validate component base test", async () => {
  const component = (val=false) => (
    <MemoryRouter>
      <AlertContext.Provider value={{addAlert: () => {}}}>
        <FilesValidate pathID={1} attributes={prepared_attributes} canValidate={val} />
      </AlertContext.Provider>
    </MemoryRouter>
  );

  global.Promise.allSettled = () => Promise.resolve([{value:{data:[]}}]);
  global.URL.revokeObjectURL = () => "";
  fileApi.get.mockResolvedValue();

  await act(async () => await render(component()));

  screen.getByRole("group");
  expect(screen.getAllByRole("listbox")).toHaveLength(3);
  screen.getByText("No files just yet or no query matches selected params.");
});

test("files validate component test", async () => {
  const component = (val=false) => (
    <MemoryRouter>
      <AlertContext.Provider value={{addAlert: () => {}}}>
        <FilesValidate pathID={1} attributes={prepared_attributes} canValidate={val} />
      </AlertContext.Provider>
    </MemoryRouter>
  );

  global.Promise.allSettled = () => Promise.resolve([{value:{data:raw_files}}]);
  global.URL.revokeObjectURL = () => "";
  fileApi.get.mockResolvedValue();

  var container;
  await act(async () => {
    const { container: c } = await render(component());
    container = c;
  });

  expect(screen.queryByText("No files just yet or no query matches selected params."))
    .toBeNull();
  expect(container.querySelector(".iss__validation")).not.toBeNull();

  // TODO test route change
});
