import { renderHook, act } from '@testing-library/react';
import useFiles from '../fileValidation';
import { raw_files, prepared_files } from "../../config/mock_data";

test("test file validation hook", () => {
  const { result: hook } = renderHook(() => useFiles());

  expect(hook.current.files).toHaveLength(0);
  act(() => hook.current.initFiles(raw_files));
  expect(hook.current.files).toEqual(prepared_files);

  const preparedAtrs = Object.entries(hook.current.files[0].attributeGroups)
    .reduce((acc, [key, val]) => {
      return {
        ...acc,
        [key]: (Array.isArray(val)
        ? val
        : Object.values(val)).reduce((newacc, ids) => [...newacc, ...ids], [])
      };
    }, {});

  act(() => {
    var newFiles = [...hook.current.files];
    var updatedFile = {...hook.current.files, status: 'd', attributes: preparedAtrs};
    newFiles[0] = {...updatedFile};
    hook.current.setFiles(newFiles);
  });
  expect(hook.current.files[0].status).toBe('d');
  expect(hook.current.files[0].attributes).toEqual(preparedAtrs);
});
