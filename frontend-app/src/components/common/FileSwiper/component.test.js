import { act, renderHook, render, screen, fireEvent } from '@testing-library/react';
import FileSwiper from '.';
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

  const component = () => (<FileSwiper
    fileManager={filesHook.current}
    sliderManager={swiperHook.current}
    pathID={1}
  />);

  const { rerender } = render(component());

  var buttons = screen.getAllByRole("button");
  expect(buttons).toHaveLength(3);
  expect(swiperHook.current.slide).toBe(0);
  screen.getByText("media_" + swiperHook.current.slide);
  fireEvent.click(buttons[2]);

  rerender(component());
  expect(swiperHook.current.slide).toBe(1);
  screen.getByText("media_" + swiperHook.current.slide);
})
