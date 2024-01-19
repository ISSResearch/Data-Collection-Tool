import { renderHook, act } from '@testing-library/react';
import useFileInput from '../fileInput';
import { prepared_attributes } from '../../config/mock_data';

afterEach(() => {
  jest.restoreAllMocks();
});

const makeFiles = (num=25) => {
  var files = [];
  for (let i = 0; i < num; i++) {
    files.push({ file: '', name: `file${i}.png`, type: 'image/png' });
  };
  return files
}

test("file input hook test", () => {
  const { result: hook } = renderHook(() => useFileInput());

  global.URL.createObjectURL = () => "url";
  global.URL.revokeObjectURL = () => "url";

  var files = makeFiles(25);

  expect(hook.current.files).toEqual({});

  act(() => hook.current.handleUpload(files.slice(0, 2)));

  var first = Object.keys(hook.current.files)[0];

  expect(Object.keys(hook.current.files)).toHaveLength(hook.current.count());
  expect(hook.current.files[first]).toEqual({
    file: { file: '', name: 'file0.png', type: 'image/png' },
    blob: "url",
    name: 'file0',
    extension: 'png',
    type: 'image',
    attributeGroups: {}
  });

  act(() => hook.current.handleUpload(files));
  expect(Object.keys(hook.current.files)).toHaveLength(hook.current.count());

  act(() => hook.current.handleNameChange({ value: 'new_name' }, first));
  expect(hook.current.files[first].name).toBe('new_name');

  act(() => hook.current.handleDelete(first));
  expect(hook.current.files[first]).toBeUndefined();
  expect(Object.keys(hook.current.files)).toHaveLength(hook.current.count());

  expect(hook.current.uploadCount()).toBe(hook.current.count());

  var keys = Object.keys(hook.current.files);
  for (var i=0; i < 5; i++) hook.current.files[keys[i]].status = true;
  expect(hook.current.uploadCount()).toBe(hook.current.count() - 5);
});

test("file input attribute groups change test", () => {
  const { result: hook } = renderHook(() => useFileInput());
  const groups = (fid) => () => hook.current.files[fid].attributeGroups;

  global.URL.createObjectURL = () => "url";
  global.URL.revokeObjectURL = () => "url";

  var files = makeFiles(2);

  expect(hook.current.files).toEqual({});
  act(() => hook.current.handleUpload(files.slice(0, 2)));

  var [fileID] = Object.keys(hook.current.files);
  var first = groups(fileID);

  expect(Object.keys(hook.current.files)).toHaveLength(2);
  expect(first()).toEqual({});

  act(() => hook.current.handleApplyGroups());
  expect(first()).toEqual({});

  act(() => hook.current.handleApplyGroups({"asd": {0: [200]}}));
  expect(first()).toEqual({ "asd": {0: [200]} });

  act(() => hook.current.handleGroupChange({ fileID, type: "add"}));
  expect(Object.keys(first())).toHaveLength(2);

  act(() => {
    var [key] = Object.keys(first());
    hook.current.handleGroupChange({ fileID, type: "delete", key });
  });
  expect(Object.keys(first())).toHaveLength(1);

  act(() => {
    var [key] = Object.keys(first());
    hook.current.handleGroupChange({fileID, key, type: "copy"})
  });
  expect(Object.keys(first())).toHaveLength(2);
  var [origin, copied] = Object.keys(first());
  expect(origin).not.toEqual(copied);
  expect(first()[origin]).toEqual(first()[copied]);

  act(() => {
    first()[copied][0] = [200];
  });
  expect(first()[origin]).not.toEqual(first()[copied]);

  act(() => {
    hook.current.handleGroupChange({
      fileID,
      type: "set",
      key: copied,
      payload: {
        selected: [201],
        index: 1,
        selInd: 1
      }
    });
    hook.current.handleGroupChange({
      fileID,
      type: "set",
      key: origin,
      payload: {
        selected: [20],
        index: 0,
        selInd: 0
      }
    })
  });
  expect(first()).toEqual({
    [origin]: { '0': [ 20 ] },
    [copied]: { '0': [ 200 ], '1': [ 201 ] }
  });
});

test("file input prepare test", () => {
  const { result: hook } = renderHook(() => useFileInput());

  expect(hook.current.validate()).toEqual({ isValid: false, message: "No files attached!" });

  act(() => hook.current.handleUpload([{ file: '', name: `file.png`, type: 'image/png' }]));
  const [fileID] = Object.keys(hook.current.files);

  expect(hook.current.validate([])).toEqual({ "isValid": true, "message": "ok" });

  expect(hook.current.validate(prepared_attributes)).toEqual({
    "isValid": false,
    "message": "File \"file\" is missing required attributes: model, gen."
  });

  act(() => hook.current.handleApplyGroups({ "123456789": { 0: [265,  299] } }));
  expect(hook.current.validate(prepared_attributes)).toEqual({
    "isValid": true,
    "message": "ok"
  });

  expect(hook.current.gatherFiles()).toEqual([
    {
      atrsGroups: [[265, 299]],
      attributeGroups: { "123456789": { "0": [265, 299] } },
      extension: "png",
      file: { file: "", name: "file.png", type: "image/png" },
      name: "file",
      type: "image",
      blob: "url"
    }
  ]);
});
