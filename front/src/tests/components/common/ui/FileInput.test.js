import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import FileInput from '../../../../components/common/ui/FileInput';
import fileInput from '../../../../hooks/fileInput';

test("file input component test", () => {
  const { result: fileManager } = renderHook(() => fileInput());
  render(<FileInput fileManager={fileManager.current}/>);
  const mock_files_upload = {};
  for (let i=0; i < 25; i++) {
    mock_files_upload[i] = { file: '', name: `file${i}.png`, type: 'image/png'};
  };

  expect(Object.entries(fileManager.current.files)).toHaveLength(0);
  fireEvent.change(
    screen.getByLabelText('UPLOAD'),
    { target: { files: mock_files_upload } }
  );
  expect(Object.entries(fileManager.current.files)).toHaveLength(20);

  // TODO: resolve blob issue
});