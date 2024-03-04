import { fireEvent, render, act, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { fileApi } from '../../../config/api';
import FileMedia from ".";
import { AlertContext } from '../../../context/Alert';
import { MemoryRouter } from 'react-router-dom';
import { prepared_files } from "../../../config/mock_data";

jest.mock('../../../config/api');
afterEach(() => {
  jest.restoreAllMocks();
});

test("file media ui component test", async() => {
  const { result: rf } = renderHook(() => useRef(null));

  const component = (slide) => (
    <MemoryRouter>
      <AlertContext.Provider value={ {alerts: []} }>
        <FileMedia ref={rf.current} files={prepared_files} slide={slide || 0} pathID={1} />
      </AlertContext.Provider>
    </MemoryRouter>
  );

  fileApi.get.mockResolvedValue({data: "key"});
  global.URL.revokeObjectURL = () => {};

  const getRender = async () => {
    var result;
    await act(async () => result = await render(component()));
    const {rerender, container} = result;

    return {
      container,
      rerender: async (slide) => {
        await act(async () => await rerender(component(slide)));
      }
    };
  };

  const getMedia = (i) => container
    .querySelector(prepared_files[i].file_type === "image" ? "img" : "video");
  const { container, rerender } = await getRender();

  expect(getMedia(0)).not.toBeNull();
  expect(getMedia(0).src)
    .toMatch(`http://localhost:9000/api/storage/project_1/${prepared_files[0].id}/?access=key`);
  expect(container.querySelector(".mediaItem").style.transform)
    .toBe("translate(0px, 0px) scale(1)");
  fireEvent.wheel(container.querySelector(".mediaItem"));

  expect(container.querySelector(".mediaItem").style.transform)
    .not.toMatch(/scale\(1\)/);
  expect(container.querySelector(".mediaItem").style.transform).
    toMatch(/translate\(0px, 0px\)/);

  fireEvent.mouseDown(container.querySelector(".mediaItem"));
  fireEvent.mouseMove(container.querySelector(".mediaItem"), { clientX: 100, clientY: 100 });
  expect(container.querySelector(".mediaItem").style.transform)
    .not.toMatch(/scale\(1\)/);
  expect(container.querySelector(".mediaItem").style.transform).
    toMatch(/translate\(100px, 100px\)/);

  act(() => rf.current.current());

  expect(container.querySelector(".mediaItem").style.transform).toBe("translate(0px, 0px) scale(1)");

  await rerender(1);
  expect(getMedia(1)).not.toBeNull();
  expect(getMedia(1).src)
    .toMatch(`http://localhost:9000/api/storage/project_1/${prepared_files[1].id}/?access=key`);
});
