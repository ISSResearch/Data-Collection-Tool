import { fireEvent, render, act, renderHook, screen } from '@testing-library/react';
import FileModification from '.';
import { MemoryRouter } from "react-router-dom";
import { api } from '../../../config/api';
import { useFiles, useSwiper } from '../../../hooks';
import { raw_files, prepared_attributes } from '../../../config/mock_data';
import { deepCopy } from '../../../utils';
import { Provider } from 'react-redux';
import createStore from "../../../store";

jest.mock("../../../config/api");
afterEach(() => {
  jest.restoreAllMocks();
});

test("file info component test", async () => {
  const { result: filesHook } = renderHook(() => useFiles());
  const { result: swiperHook } = renderHook(() => useSwiper());

  const component = () => <Provider store={createStore()}>
    <MemoryRouter>
      <FileModification
        fileManager={filesHook.current}
        attributes={prepared_attributes}
        slide={swiperHook.current.slide}
        slideInc={swiperHook.slideInc}
      />
  </MemoryRouter>
  </Provider>;

  var files  = deepCopy(raw_files);
  files[0].status = "v";

  api.request.mockResolvedValue({});
    act(() => {
      filesHook.current.initFiles(files);
      swiperHook.current.setMax(files.length);
    });

  const { rerender, container } = render(component());

  expect(swiperHook.current.slide).toBe(0);
  expect(screen.getByRole('heading').innerHTML)
    .toBe(filesHook.current.files[swiperHook.current.slide].id.toString());
  expect(container.querySelector(".iss__fileInfo__validator")).toBeNull();
  expect(screen.getByRole('button', { name: /Decline/})).not.toBeNull();
  expect(screen.getByRole('button', { name: /Accept/})).not.toBeNull();

  await act(async () => {
    fireEvent.change(screen.getByRole('combobox', {name: 'model'}), { target: { value: '265'}});
    fireEvent.change(screen.getByRole('combobox', {name: 'gen'}), { target: { value: '267'}});
    await fireEvent.click(screen.getByRole('button', { name: /Decline/}));
  });
  expect(swiperHook.current.slide).toBe(0);

  rerender(component());
  expect(container.querySelector(".iss__fileInfo__validator")).not.toBeNull();
  expect(screen.getByRole('heading').innerHTML)
    .toBe(filesHook.current.files[swiperHook.current.slide].id.toString());
});
