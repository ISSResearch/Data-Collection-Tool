import { render, renderHook, screen, act } from '@testing-library/react';
import FileSelector from '.';
import { useFiles, useSwiper } from '../../../hooks';
import { raw_files } from '../../../config/mock_data';

test("file selector component test", () => {
  const { result: filesHook } = renderHook(() => useFiles());
  const { result: swiperHook } = renderHook(() => useSwiper());

  act(() => {
    filesHook.current.initFiles(raw_files);
    swiperHook.current.setMax(raw_files.length);
  });

  render(
    <FileSelector
      fileManager={filesHook.current}
      sliderManager={swiperHook.current}
    />
  );

  expect(screen.getAllByRole('heading')).toHaveLength(raw_files.length);
});
