import { screen, render, renderHook, act } from '@testing-library/react';
import UploadingView from '../../components/UploadingView';
import { useFileInput, useFileUploader } from '../../hooks';

afterEach(() => {
  jest.restoreAllMocks();
});

jest.mock('../../hooks/fileUploader');

test("uploading view component test", () => {
  const { result: hookItem } = renderHook(() => useFileInput());
  act(() => {
    hookItem.current.handleUpload([
      {file: '', name: `file1.png`, type: 'image/png'}
    ]);
  });

  const file = {file: '', name: `file1`, type: 'image/png'};
  useFileUploader.mockReturnValue({
    files: [file],
    setFiles: jest.fn(),
    proceedUpload: jest.fn(),
  });

  const { rerender } = render(<UploadingView fileManager={hookItem.current} />);

  let [result, name, progressWrap] = screen.getByText('file1').parentNode.childNodes;
  let [progress] = progressWrap.childNodes;

  expect(result.className).toBe('iss__uploadProgress__completion ');
  expect(name.className).toBe('iss__uploadProgress__fileName ');
  expect(progress.style.width).toBe('0%');

  file.progress = 50;
  file.status = 'a';

  rerender(<UploadingView fileManager={hookItem.current} />)

  let [newresult, newname] = screen.getByText('file1').parentNode.childNodes;
  let [newprogress] = progressWrap.childNodes;

  expect(newresult.className).toBe('iss__uploadProgress__completion complete-status-a');
  expect(newname.className).toBe('iss__uploadProgress__fileName name-status-a');
  expect(newprogress.style.width).toBe('50%');
});