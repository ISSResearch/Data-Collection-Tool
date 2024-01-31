import { fireEvent, render, renderHook, act, screen } from '@testing-library/react';
import FileDownloadSelector from '.';
import { AlertContext } from '../../../context/Alert';
import { MemoryRouter } from "react-router-dom"
import { useFiles } from '../../../hooks/';
import { api } from '../../../config/api';
import { raw_files } from "../../../config/mock_data";

jest.mock("../../../config/api");
afterEach(() => {
  jest.restoreAllMocks();
});

test("download selcetor form component test", async () => {
  const { result: files } = renderHook(() => useFiles());

  api.get.mockResolvedValue({data:raw_files});
  const component = (nw=false, opt="") => (
    <MemoryRouter>
      <AlertContext.Provider value={{addAlert: () => {}}}>
        <FileDownloadSelector
          pathID={1}
          newFiles={nw}
          option={{value: opt}}
          fileManager={files.current}
        />
      </AlertContext.Provider>
    </MemoryRouter>
  );

  const init = async() => {
    var rerender, container;
    await act( async () => {
      const {rerender: r, container: c} = await render(component());
      rerender = r;
      container = c;
    });

    return {
      container,
      rerender: async (nw, opt) => await act(async() => await rerender(component(nw, opt)))
    }
  }

  const { container, rerender } = await init();
  await rerender();

  expect(screen.getAllByRole("checkbox")).toHaveLength(raw_files.length);

  raw_files.forEach(({status, is_downloaded}, index) => {
    expect(!is_downloaded).toBe(screen.getAllByRole("checkbox")[index].checked);
    expect(container.querySelector(".file--" + status)).not.toBeNull();
  });

  expect(screen.getAllByRole("checkbox")[0].checked).toBeFalsy();
  expect(files.current.files[0].is_downloaded).toBeTruthy();
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  expect(screen.getAllByRole("checkbox")[0].checked).toBeTruthy();
  expect(files.current.files[0].is_downloaded).toBeFalsy();
});
