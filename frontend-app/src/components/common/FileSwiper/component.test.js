import { act, renderHook, render, screen, fireEvent } from '@testing-library/react';
import FileSwiper from '.';
import { Provider } from 'react-redux';
import createStore from '../../../store';
import { useFiles, useSwiper } from '../../../hooks';
import { raw_files } from '../../../config/mock_data';

jest.mock('../../ui/FileMedia', () => ({slide}) => "media_" + slide);
afterEach(() => {
  jest.restoreAllMocks();
});

test("file swiper component test", () => {
  const { result: filesHook } = renderHook(() => useFiles());
  const { result: swiperHook } = renderHook(() => useSwiper());

  act(() => {
    filesHook.current.initFiles(raw_files);
    swiperHook.current.setMax(raw_files.length);
  });

  const component = () => (
    <Provider store={createStore()}>
      <FileSwiper
        fileManager={filesHook.current}
        slide={swiperHook.current.slide}
        slideInc={swiperHook.current.slideInc}
        slideDec={swiperHook.current.slideDec}
        pathID={1}
      />
    </Provider>
  );

  const { rerender } = render(component());

  var buttons = screen.getAllByRole("button");
  expect(buttons).toHaveLength(4);
  expect(swiperHook.current.slide).toBe(0);
  screen.getByText("media_" + swiperHook.current.slide);
  fireEvent.click(buttons[2]);

  rerender(component());
  expect(swiperHook.current.slide).toBe(1);
  screen.getByText("media_" + swiperHook.current.slide);
});
