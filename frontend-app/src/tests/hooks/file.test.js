import { renderHook, act } from '@testing-library/react';
import useFile from '../../hooks/file';
import { mock_raw_file, mock_prepared_attributes } from '../_mock';

test("file hook test", () => {
  const { result: hookItem } = renderHook(() => useFile());

  expect(hookItem.current.file).toEqual({});
  act(() => hookItem.current.initFile(mock_raw_file));
  expect(hookItem.current.file).toEqual(mock_raw_file);
  act(() => hookItem.current.changeName({value: 'new_name'}));
  expect(hookItem.current.file.file_name).toEqual('new_name');
  act(() => {
    hookItem.current.setAttributeGroups({
      ids: [1,2,3],
      selectorKey: 'group',
      selInd: 0,
    })
  });
  expect(hookItem.current.file.attributeGroups.group).toEqual({'0': [1,2,3]});
  act(() => {
    hookItem.current.setAttributeGroups({
      selectorKey: 'group',
      selInd: 0,
      del: true
    })
  });
  expect(hookItem.current.file.attributeGroups.group).toBeUndefined();
  act(() => {
    hookItem.current.setAttributeGroups({
      ids: {group: [3,4,5]},
      selInd: 0,
      set: true
    })
  });
  expect(hookItem.current.file.attributeGroups).toEqual({group: [3,4,5]});
});

test("test file validate", () => {
  const { result: hookItem } = renderHook(() => useFile());
  act(() => hookItem.current.initFile(mock_raw_file));
  expect(hookItem.current.validate(mock_prepared_attributes)).toEqual({
    "isValid": false,
    "message": "File \"blog2_copy.png\" is missing required attributes: model, gen."
  });
  act(() => hookItem.current.setAttributeGroups({
    ids: [262, 264],
    selectorKey: Object.keys(hookItem.current.file.attributeGroups)[0],
    selInd: 0,
  }));
  expect(hookItem.current.validate(mock_prepared_attributes)).toEqual({
    "isValid": true,
    "message": "ok"
  });
});