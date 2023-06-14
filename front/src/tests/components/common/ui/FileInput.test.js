import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import FileInput from '../../../../components/common/ui/FileInput';
import fileInput from '../../../../hooks/fileInput';

test("file input component test", () => {
  const { result: fileManager } = renderHook(() => fileInput());
  const { getByText } = render(<FileInput fileManager={fileManager.current}/>);
});