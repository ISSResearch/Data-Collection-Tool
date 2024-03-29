import { fireEvent, render, renderHook, act, screen } from '@testing-library/react';
import FileDownloadSelector from '.';
import { Provider } from 'react-redux';
import createStore from "../../../store";
import { MemoryRouter } from "react-router-dom";
import { useFiles } from '../../../hooks/';
import { api } from '../../../config/api';
import { raw_files } from "../../../config/mock_data";

jest.mock("../../../config/api");
afterEach(() => {
  jest.restoreAllMocks();
});

test("download selector form component test", async () => {
  const { result: files } = renderHook(() => useFiles());

  api.get.mockResolvedValue({data:{data:[]}});

  const component = (nw=false) => (
    <Provider store={createStore()}>
      <MemoryRouter>
        <FileDownloadSelector
          params={{}}
          pathID={1}
          newFiles={nw}
          fileManager={files.current}
        />
      </MemoryRouter>
    </Provider>
  );

  const init = async() => {
    var rerender, container, unmount;
    await act( async () => {
      const {unmount: u, rerender: r, container: c} = await render(component());
      rerender = r;
      container = c;
      unmount = u;
    });

    return {
      container,
      unmount,
      rerender: async (nw, opt) => await act(async() => await rerender(component(nw, opt)))
    };
  };

  var { unmount, rerender: _r } = await init();
  await _r();

  expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  screen.getByText(/No Data/);
  unmount();

  api.get.mockResolvedValue({data:{data:raw_files}});
  var { container, rerender } = await init();
  await rerender();

  expect(screen.getAllByRole("checkbox")).toHaveLength(raw_files.length);
  expect(screen.queryByText(/No Data/)).toBeNull();

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
