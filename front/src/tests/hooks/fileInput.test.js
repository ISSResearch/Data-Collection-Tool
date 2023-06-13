import { renderHook, act } from '@testing-library/react';
import useFileInput from '../../hooks/fileInput';
import { mock_prepared_attributes } from '../_mock';

test("file input hook test", () => {
  const { result: hookItem } = renderHook(() => useFileInput());
  const files = [];
  for (let i=0; i < 25; i++) {
    files.push({file: '', name: `file${i}.png`, type: 'image/png'});
  };

  expect(hookItem.current.files).toEqual({});
  act(() => hookItem.current.handleUpload(files.slice(0, 2)));

  const firstEl = Object.keys(hookItem.current.files)[0];

  expect(Object.keys(hookItem.current.files).length).toBe(2);
  expect(hookItem.current.files[firstEl]).toEqual({
    file: { file: '', name: 'file0.png', type: 'image/png' },
    name: 'file0',
    extension: 'png',
    type: 'image',
    attributeGroups: {}
  });
  act(() => hookItem.current.handleUpload(files));
  expect(Object.keys(hookItem.current.files).length).toBe(20);
  act(() => hookItem.current.handleNameChange({value: 'new_name'}, firstEl));
  expect(hookItem.current.files[firstEl].name).toBe('new_name');
  act(() => {
    hookItem.current.setAttributeGroups({
      fileID: firstEl,
      ids: [1,2,3],
      selectorKey: 'group',
      selInd: 0,
    })
  });
  expect(Object.values(hookItem.current.files[firstEl].attributeGroups)[0]).toEqual({'0': [1,2,3]});
  act(() => {
    hookItem.current.setAttributeGroups({
      fileID: firstEl,
      ids: [1,2,3],
      selectorKey: Object.keys(hookItem.current.files[firstEl].attributeGroups)[0],
      selInd: 0,
      del: true
    })
  });
  expect(Object.values(hookItem.current.files[firstEl].attributeGroups)).toEqual([]);
  act(() => {
    hookItem.current.setAttributeGroups({
      fileID: firstEl,
      ids: {group: [3,4,5]},
      selectorKey: Object.keys(hookItem.current.files[firstEl].attributeGroups)[0],
      selInd: 0,
      set: true
    })
  });
  expect(hookItem.current.files[firstEl].attributeGroups).toEqual({group: [3,4,5]});
  act(() => hookItem.current.handleDelete(firstEl));
  expect(hookItem.current.files[firstEl]).toBe(undefined);
});

test("files prepare test", () => {
  const { result: hookItem } = renderHook(() => useFileInput());
  act(() => hookItem.current.handleUpload([{file: '', name: `file.png`, type: 'image/png'}]));

  const firstEl = Object.keys(hookItem.current.files)[0];

  expect(hookItem.current.validate(mock_prepared_attributes)).toEqual({
    "isValid": false,
    "message": "File \"file\" is missing required attributes: model, gen."
  });
  act(() => {
    hookItem.current.setAttributeGroups({
      fileID: firstEl,
      ids: [262, 264],
      selectorKey: 'group',
      selInd: 0,
    })
  });
  expect(hookItem.current.validate(mock_prepared_attributes)).toEqual({
    "isValid": true,
    "message": "ok"
  });
  expect(hookItem.current.gatherFiles()).toEqual([
    {
      "atrsGroups": [[262, 264]],
      "attributeGroups": {"group": {"0": [262, 264]}},
      "extension": "png",
      "file": {"file": "", "name": "file.png", "type": "image/png"},
      "name": "file",
      "type": "image"
    }
  ]);
});