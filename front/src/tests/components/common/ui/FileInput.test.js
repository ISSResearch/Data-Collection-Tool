import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import FileInput from '../../../../components/common/ui/FileInput';
import fileInput from '../../../../hooks/fileInput';

jest.mock('../../../../components/common/FileUploadCard', () => ({
  FileUploadCard: () => 'upload card'
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test("file input component test", () => {
  const { result: fileManager } = renderHook(() => fileInput());

  const { rerender } = render(<FileInput fileManager={fileManager.current}/>);

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

  rerender(<FileInput fileManager={fileManager.current}/>);

  screen.getByText(/20 items/);
  expect(screen.getAllByText('upload card')).toHaveLength(20);
});