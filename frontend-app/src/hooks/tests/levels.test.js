import { renderHook, act } from '@testing-library/react';
import useLevels from '../levels';

var mock_levels = [
  { id: 1, name: 'preset_level', multiple: false },
  { id: 2, name: 'preset_child_level', required: true }
];
var formID = "123-e-zxczxc";

test("level basic test", () => {
  const { result: hook } = renderHook(() => useLevels());

  act(() => {
    hook.current.initLevel(formID + 1);
    hook.current.initLevel(formID, mock_levels);
  });

  var { levels } = hook.current;
  expect(Object.keys(levels)).toHaveLength(2);
  expect(levels[formID + 1]).toEqual([]);
  expect(levels[formID]).toEqual(mock_levels);

  act(() => hook.current.destroyLevel(formID + 1));
  expect(hook.current.levels[formID + 1]).toBeUndefined();
});

test("level manipulate test", () => {
  const { result: hook } = renderHook(() => useLevels());

  act(() => hook.current.initLevel(formID, mock_levels));

  var initLen = hook.current.levels[formID].length;
  act(() => hook.current.addLevel(formID));
  act(() => hook.current.addLevel(formID));

  expect(hook.current.levels[formID]).toHaveLength(initLen + 2);

  hook.current.levels[formID][initLen + 1].multiple = true;
  try { act(() => hook.current.addLevel(formID)); }
  catch ({message}) { expect(message).toBe("You can`t set new level after multiple one."); }

  expect(hook.current.levels[formID]).toHaveLength(initLen + 2);

  act(() => hook.current.delLevel(formID, initLen + 1));
  act(() => hook.current.delLevel(formID, initLen));

  expect(hook.current.levels[formID]).toHaveLength(initLen);

  act(() => {
    hook.current.changeLevel(formID, {value: "newName"}, 0);
  });
  expect(hook.current.levels[formID][0].name).toBe("newName");
  act(() => hook.current.findAndReplace("newName", "replacedName"));
  expect(hook.current.levels[formID][0].name).toBe("replacedName");

  act(() => {
    hook.current.setRequired(formID, 0);
    hook.current.setRequired(formID, 1);
    hook.current.setMultiple(formID, 1);
  });

  try { act(() => hook.current.setMultiple(formID, 0)); }
  catch({message}) { expect(message).toBe("Cannot set properties of undefined (setting 'checked')"); }

  expect(hook.current.levels[formID][0].required).toBeTruthy();
  expect(hook.current.levels[formID][1].required).toBeFalsy();
  expect(hook.current.levels[formID][0].multiple).toBeFalsy();
  expect(hook.current.levels[formID][1].multiple).toBeTruthy();
});
