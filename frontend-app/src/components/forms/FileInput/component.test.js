import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import FileInput from '.';
import { AlertContext } from '../../../context/Alert';
import { useFileInput } from '../../../hooks';

afterEach(() => {
  jest.restoreAllMocks();
});

test("file input component test", () => {
  const { result: fileManager } = renderHook(() => useFileInput());
  global.URL.createObjectURL = () => "";

  const component = () => (
    <AlertContext.Provider value={{addAlert: () => {}}}>
      <FileInput fileManager={fileManager.current} />
    </AlertContext.Provider>
  );
  const { rerender, container } = render(component());

  const upload_files = {};
  for (let i = 0; i < 25; i++) {
    upload_files[i] = { file: '', name: `file${i}.png`, type: 'image/png' };
  }

  expect(Object.entries(fileManager.current.files)).toHaveLength(0);
  fireEvent.change(
    screen.getByLabelText('UPLOAD'),
    { target: { files: upload_files } }
  );
  expect(Object.entries(fileManager.current.files)).toHaveLength(Object.keys(upload_files).length);

  rerender(component());

  screen.getByText(/25 items/);
  expect(container.querySelectorAll(".iss__fileuploadCard")).toHaveLength(25);
});
