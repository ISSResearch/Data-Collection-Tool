import { renderHook, act } from '@testing-library/react';
import useAttributes from '../attributes';
import { prepared_attributes } from '../../config/mock_data';

var mock_attrs = prepared_attributes[0].attributes.reduce((acc, item, index) => {
  acc.push({...item, children: [], path: index.toString()});
  return acc;
}, []);
var formID = "123-e-zxczxc";

test("attribute basic test", () => {
  const { result: hook } = renderHook(() => useAttributes());

  act(() => {
    hook.current.initAttribute(formID + 1);
    hook.current.initAttribute(formID, mock_attrs);
  });

  var { attributes } = hook.current;
  expect(Object.keys(attributes)).toHaveLength(2);
  expect(attributes[formID + 1]).toEqual([]);
  expect(attributes[formID]).toEqual(mock_attrs);

  act(() => hook.current.destroyAttribute(formID + 1));
  expect(hook.current.attributes[formID + 1]).toBeUndefined();
});

test("attribute manipulate test", () => {
  const { result: hook } = renderHook(() => useAttributes());

  act(() => hook.current.initAttribute(formID, mock_attrs));

  var initLen = hook.current.attributes[formID].length;
  act(() => {
    hook.current.addAttribute(formID);
    hook.current.addAttribute(formID, initLen.toString());
    hook.current.addAttribute(formID, initLen.toString());
    hook.current.addAttribute(formID, initLen.toString());
  });

  var attrs = hook.current.attributes[formID];
  expect(attrs).toHaveLength(initLen + 1);
  expect(attrs[initLen].children).toHaveLength(3);

  act(() => {
    hook.current.delAttribute(formID, "1");
    hook.current.delAttribute(formID, "1_0", true);
  });

  attrs = hook.current.attributes[formID];
  expect(attrs).toHaveLength(2);
  expect(attrs[1].children).toHaveLength(2);

  act(() => hook.current.handleLevelRemove(formID, 1));
  expect(hook.current.attributes[formID][1].children).toHaveLength(0);

  act(() => {
    hook.current.handleChange(formID, {value: "newName"}, "0");
    hook.current.addAttribute(formID, "0");
    hook.current.addAttribute(formID, "0");
    hook.current.handleChange(formID, {value: "newName"}, "0_0", true);
  });

  attrs = hook.current.attributes[formID];
  expect(attrs[0].name).toBe("newName");
  expect(attrs[0].children[0].name).toBe("newName");

  act(() => hook.current.findAndReplace("newName", "replacedName"));

  attrs = hook.current.attributes[formID];
  expect(attrs[0].name).toBe("replacedName");
  expect(attrs[0].children[0].name).toBe("replacedName");

  act(() => {
    hook.current.moveDown(formID, "0", 0);
    hook.current.moveUp(formID, "1_1", 1);
  });

  attrs = hook.current.attributes[formID];
  expect(attrs[1].name).toBe("replacedName");
  expect(attrs[0].name).toBe("");
  expect(attrs[1].children[0].name).toBe("");
  expect(attrs[1].children[1].name).toBe("replacedName");

  var gather;
  act(() => gather = hook.current.gather(formID));

  expect(gather).toHaveLength(2);
  expect(Object.keys(gather[0])).toEqual(["id", "path", "name", "children", "order"]);
});
