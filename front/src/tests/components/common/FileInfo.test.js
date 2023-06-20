import { fireEvent, render, act, renderHook, screen } from '@testing-library/react';
import FileInfo from '../../../components/common/FileInfo';
import { useFiles, useSwiper } from '../../../hooks';
import { mock_raw_files, mock_prepared_attributes } from '../../_mock';

test("file info component test", () => {
  const { result: filesHook } = renderHook(() => useFiles());
  const { result: swiperHook } = renderHook(() => useSwiper());

  act(() => {
    filesHook.current.initFiles(mock_raw_files);
    swiperHook.current.setMax(mock_raw_files.length);
  });

  const { rerender } = render(
    <FileInfo
      fileManager={filesHook.current}
      sliderManager={swiperHook.current}
      attributes={mock_prepared_attributes}
    />
  );

  expect(swiperHook.current.slide).toBe(0);
  expect(screen.getByRole('heading').innerHTML)
    .toBe(filesHook.current.files[swiperHook.current.slide].file_name);
  expect(screen.getByRole('button', { name: /Decline/})).not.toBeNull();
  expect(screen.getByRole('button', { name: /Accept/})).not.toBeNull();

  fireEvent.change(screen.getByRole('combobox', {name: 'model'}), { target: { value: '265'}});
  fireEvent.change(screen.getByRole('combobox', {name: 'gen'}), { target: { value: '267'}});
  fireEvent.click(screen.getByRole('button', { name: /Accept/}));
  expect(filesHook.current.files[swiperHook.current.slide-1].status).toBe('a');
  expect(swiperHook.current.slide).toBe(1);

  rerender(<FileInfo
    fileManager={filesHook.current}
    sliderManager={swiperHook.current}
    attributes={mock_prepared_attributes}
  />);
  expect(screen.getByRole('heading').innerHTML)
    .toBe(filesHook.current.files[swiperHook.current.slide].file_name);
});
