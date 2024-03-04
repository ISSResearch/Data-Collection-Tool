import { screen, render, renderHook, act } from '@testing-library/react';
import UploadingView from '.';
import { AlertContext } from '../../../context/Alert';
import { useFileInput, useFileUploader } from '../../../hooks';

jest.mock('../../../hooks/fileUploader');
afterEach(() => {
  jest.restoreAllMocks();
});

test("uploading view component test", () => {
  const { result: hookItem } = renderHook(() => useFileInput());
  const component = () => <AlertContext.Provider value={{addAlert: () => {}}}>
    <UploadingView fileManager={hookItem.current} />
  </AlertContext.Provider>;

  global.URL.createObjectURL = () => {};
  act(() => {
    hookItem.current.handleUpload([
      { file: '', name: `file1.png`, type: 'image/png' }
    ]);
  });

  var file = { file: '', name: `file1`, type: 'image/png' };
  useFileUploader.mockReturnValue({
    files: [file],
    setFiles: jest.fn(),
    proceedUpload: jest.fn(),
  });

  const { rerender, container } = render(component());

  var [result, name, progressWrap] = screen.getByText('file1').parentNode.childNodes;
  var [progress] = progressWrap.childNodes;

  expect(container.querySelector("#authModal").open).toBeFalsy();
  expect(result.className).toBe('iss__uploadProgress__completion ');
  expect(name.className).toBe('iss__uploadProgress__fileName ');
  expect(progress.style.width).toBe('0%');

  file.progress = 50;
  file.status = 'a';

  rerender(component());

  var [newresult, newname] = screen.getByText('file1').parentNode.childNodes;
  var [newprogress] = progressWrap.childNodes;

  expect(newresult.className).toBe('iss__uploadProgress__completion complete-status-a');
  expect(newname.className).toBe('iss__uploadProgress__fileName name-status-a');
  expect(newprogress.style.width).toBe('50%');
});
