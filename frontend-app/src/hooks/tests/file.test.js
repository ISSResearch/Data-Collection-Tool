import { renderHook, act } from '@testing-library/react';
import { deepCopy } from '../../utils';
import useFile from '../file';
import { raw_file, prepared_attributes } from '../../config/mock_data';

test("file hook test", () => {
  const { result: hook } = renderHook(() => useFile());
  const attrs = deepCopy(prepared_attributes);
  attrs[0].children[0].required = true;

  expect(hook.current.file).toEqual({});

  act(() => hook.current.initFile(raw_file));
  expect(hook.current.file).toEqual(raw_file);

  act(() => hook.current.changeName({value: 'new_name'}));
  expect(hook.current.file.file_name).toEqual('new_name');

  expect(hook.current.validate(attrs)).toEqual({
    "isValid": false,
    "message": "File \"new_name\" is missing required attributes: model."
  });
  expect(hook.current.validate([])).toEqual({ "isValid": true, "message": "ok" });

  var prepared;
  act(() => {
    prepared = hook.current.prepareAttributes();
  });
  expect(prepared).toEqual({ '99610f4b-724a-4175-a580-740b5f8559a5': [ 246 ] });

  act(() => {
    hook.current.file.attributeGroups = null;
    prepared = hook.current.prepareAttributes();
  });
  expect(prepared).toEqual({});
});

test("file groupchange test", () => {
  const { result: hook } = renderHook(() => useFile());
  const groups = () => hook.current.file.attributeGroups;

  act(() => hook.current.initFile(raw_file));
  expect(Object.keys(groups())).toHaveLength(1);

  act(() => hook.current.handleGroupChange({type: "add"}));
  expect(Object.keys(groups())).toHaveLength(2);

  act(() => {
    var [_, key] = Object.keys(groups());
    hook.current.handleGroupChange({ type: "delete", key });
  });
  expect(Object.keys(groups())).toHaveLength(1);

  act(() => {
    var [key] = Object.keys(groups());
    hook.current.handleGroupChange({key, type: "copy"})
  });
  expect(Object.keys(groups())).toHaveLength(2);
  var [origin, copied] = Object.keys(groups());
  expect(origin).not.toEqual(copied);
  expect(groups()[origin]).toEqual(groups()[copied]);

  act(() => {
    groups()[copied][0] = [200];
  });
  expect(groups()[origin]).not.toEqual(groups()[copied]);

  act(() => {
    hook.current.handleGroupChange({
      type: "set",
      key: copied,
      payload: {
        selected: [201],
        index: 1,
        selInd: 1
      }
    });
    hook.current.handleGroupChange({
      type: "set",
      key: origin,
      payload: {
        selected: [20],
        index: 0,
        selInd: 0
      }
    })
  });
  expect(groups()).toEqual({
    [origin]: { '0': [ 20 ] },
    [copied]: { '0': [ 200 ], '1': [ 201 ] }
  });
});
