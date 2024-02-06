import { render, renderHook, screen } from '@testing-library/react';
import FileUploadCard from '.';
import useFileInput from '../../../hooks/fileInput';
import { prepared_attributes } from '../../../config/mock_data';

jest.mock("../../forms/SelectorGroup", () => () => "selectgroup");
afterEach(() => {
  jest.restoreAllMocks();
});

test("file upload card test", () => {
  const { result: hookItem } = renderHook(() => useFileInput());

  const file = { type: 'image', name: 'file_name' };
  const file2 = { type: 'video', name: 'file_name2' };

  window.URL.createObjectURL = function() { };

  const { rerender } = render(
    <FileUploadCard
      file={file}
      fileID={1}
      attributes={prepared_attributes}
      fileManager={hookItem.current}
    />
  );

  expect(screen.getByRole('textbox').value).toBe(file.name);
  expect(screen.getByTestId('media').tagName).toBe('DIV');

  rerender(
    <FileUploadCard
      file={file2}
      fileID={1}
      attributes={prepared_attributes}
      fileManager={hookItem.current}
    />
  );

  expect(screen.getByRole('textbox').value).toBe(file2.name);
  expect(screen.getByTestId('media').tagName).toBe('VIDEO');
});
