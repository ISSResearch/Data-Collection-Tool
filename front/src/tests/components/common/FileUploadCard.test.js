import { render, renderHook, screen } from '@testing-library/react';
import useFileInput from '../../../hooks/fileInput';
import { FileUploadCard } from '../../../components/common/FileUploadCard';
import {
  mock_prepared_files,
  mock_prepared_attributes,
  mock_apply_groups
} from '../../_mock';

test("file upload card test", () => {
  const { result: hookItem } = renderHook(() => useFileInput());
  // TODO: resolve blobl issue
  // render(
  //   <FileUploadCard
  //     file={mock_prepared_files[0]}
  //     fileID={1}
  //     attributes={mock_prepared_attributes}
  //     applyGroups={mock_apply_groups}
  //     fileManager={hookItem.current}
  //   />
  // );
});