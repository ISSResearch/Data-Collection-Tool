import { render, renderHook, screen, act } from '@testing-library/react';
import FileSelector from '../../../components/common/FileSelector';
import { useFiles, useSwiper } from '../../../hooks';
import { mock_raw_files } from '../../_mock';

test("file selector component test", () => {
  const { result: filesHook } = renderHook(() => useFiles());
  const { result: swiperHook } = renderHook(() => useSwiper());

  act(() => {
    filesHook.current.initFiles(mock_raw_files);
    swiperHook.current.setMax(mock_raw_files.length);
  });

  render(
    <FileSelector
      fileManager={filesHook.current}
      sliderManager={swiperHook.current}
    />
  );

  expect(screen.getAllByRole('heading')).toHaveLength(mock_raw_files.length);
});