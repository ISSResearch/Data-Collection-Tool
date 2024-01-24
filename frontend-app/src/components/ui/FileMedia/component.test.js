import { fireEvent, render, screen, act } from '@testing-library/react';
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
  const component = slide => (
    <MemoryRouter>
      <AlertContext.Provider value={ {alerts: []} }>
        <FileMedia files={prepared_files} slide={slide || 0} pathID={1} />
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
    }
  };

  const getMedia = (i) => container.querySelector(prepared_files[i].file_type);
  const { container, rerender } = await getRender();

  expect(getMedia(0)).not.toBeNull();
  expect(getMedia(0).src)
    .toMatch(`http://localhost:9000/api/storage/project_1/${prepared_files[0].id}/?access=key`);
  expect(container.querySelector(".mediaItem").style.transform).toBe("translate(0px, 0px) scale(1)");
});
