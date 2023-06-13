import { renderHook, act } from '@testing-library/react';
import useFiles from '../../hooks/fileValidation';
import { mock_raw_files, mock_prepared_files } from "../_mock";

test("test file validation hook", () => {
  const { result: hookItem } = renderHook(() => useFiles());

  expect(hookItem.current.files).toEqual([]);
  act(() => hookItem.current.initFiles(mock_raw_files));
  expect(hookItem.current.files).toEqual(mock_prepared_files);

  const preparedAtrs = Object.entries(hookItem.current.files[0].attributeGroups)
    .reduce((acc, [key, val]) => {
      return {
        ...acc,
        [key]: (Array.isArray(val)
        ? val
        : Object.values(val)).reduce((newacc, ids) => [...newacc, ...ids], [])
      }
    }, {});

  act(() => {
    const newFiles = [...hookItem.current.files];
    const updatedFile = {...hookItem.current.files, status: 'd', attributes: preparedAtrs};
    newFiles[0] = {...updatedFile};
    hookItem.current.setFiles(newFiles);
  });
  expect(hookItem.current.files[0].status).toBe('d');
  expect(hookItem.current.files[0].attributes).toEqual(preparedAtrs);
});
