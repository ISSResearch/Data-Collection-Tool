import { renderHook, act } from '@testing-library/react';
import useAttributeManager from '../../hooks/attributeManager';
import { mock_prepared_attributes } from '../_mock';

test("attribute manager hook test", () => {
  const { result: hookItem } = renderHook(() => useAttributeManager());

  expect(hookItem.current.formHook.forms).toEqual({});
  act(() => {
    hookItem.current.formHook.addForm({});
    hookItem.current.formHook.addForm({});
  });
  expect(Object.keys(hookItem.current.formHook.forms)).toHaveLength(2);
  expect(Object.values(hookItem.current.formHook.forms)[0]).toEqual({
    'attributes': null,
    'levels': null
  });
  act(() => {
    const deleteId = Object.keys(hookItem.current.formHook.forms)[1];
    hookItem.current.formHook.deleteForm(deleteId);
  });
  expect(Object.keys(hookItem.current.formHook.forms)).toHaveLength(1);
  act(() => hookItem.current.formHook.clearForms());
  expect(hookItem.current.formHook.forms).toEqual({});
});

test("attribute manager hook level test", () => {
  const { result: hookItem } = renderHook(() => useAttributeManager());
  act(() => hookItem.current.formHook.addForm({}));
  const formID = Object.keys(hookItem.current.formHook.forms)[0];
  act(() => hookItem.current.levelHook.addLevel(formID));
  act(() => hookItem.current.levelHook.addLevel(formID));
  expect(hookItem.current.levelHook.levels[formID]).toHaveLength(2);
  act(() => hookItem.current.levelHook.delLevel(formID, 1));
  expect(hookItem.current.levelHook.levels[formID]).toHaveLength(1);
  act(() => {
    hookItem.current.levelHook.changeLevel(formID, {value: 'new_name'}, 0);
    hookItem.current.levelHook.setRequired(formID, 0);
  });
  expect(hookItem.current.levelHook.levels[formID][0].name).toBe('new_name');
  expect(hookItem.current.levelHook.levels[formID][0].required).toBeTruthy();
  act(() => hookItem.current.levelHook.setRequired(formID, 0));
  expect(hookItem.current.levelHook.levels[formID][0].required).toBeFalsy();
  act(() => hookItem.current.levelHook.addLevel(formID));
  try { act(() => hookItem.current.levelHook.setMultiple(formID, 0, {})); }
  catch ({message}) {}
  expect(hookItem.current.levelHook.levels[formID][0].multiple).toBeFalsy();
  act(() => hookItem.current.levelHook.setMultiple(formID, 1, {}));
  expect(hookItem.current.levelHook.levels[formID][1].multiple).toBeTruthy();
  try { act(() => hookItem.current.levelHook.addLevel(formID)); }
  catch ({message}) {}
  expect(hookItem.current.levelHook.levels[formID]).toHaveLength(2);
  act(() => hookItem.current.levelHook.destroyLevel(formID));
  expect(hookItem.current.levelHook.levels[formID]).toBeUndefined();
});

test("attribute manager hook attribute test", () => {
  const { result: hookItem } = renderHook(() => useAttributeManager());
  act(() => hookItem.current.formHook.addForm({}));
  const formID = Object.keys(hookItem.current.formHook.forms)[0];
  act(() => hookItem.current.attributeHook.addAttribute(formID));
  act(() => hookItem.current.attributeHook.addAttribute(formID));
  expect(hookItem.current.attributeHook.attributes[formID][0].children).toHaveLength(0);
  expect(hookItem.current.attributeHook.attributes[formID]).toHaveLength(2);
  act(() => hookItem.current.attributeHook.delAttribute(formID, '1'));
  expect(hookItem.current.attributeHook.attributes[formID]).toHaveLength(1);
  act(() => hookItem.current.attributeHook.addAttribute(formID, '0'));
  expect(hookItem.current.attributeHook.attributes[formID][0].children).toHaveLength(1);
  act(() => {
    hookItem.current.attributeHook.handleChange(formID, {value: 'new_name'}, '0');
    hookItem.current.attributeHook.handleChange(formID, {value: 'new_child_name'}, '0_0', true);
  });
  expect(hookItem.current.attributeHook.attributes[formID][0].name).toBe('new_name');
  expect(hookItem.current.attributeHook.attributes[formID][0].children[0].name).toBe('new_child_name');
  act(() => hookItem.current.attributeHook.delAttribute(formID, '0_0', true));
  expect(hookItem.current.attributeHook.attributes[formID][0].children).toHaveLength(0);
  act(() => hookItem.current.attributeHook.addAttribute(formID, '0'));
  act(() => hookItem.current.attributeHook.handleLevelRemove(formID, 1));
  expect(hookItem.current.attributeHook.attributes[formID][0].children).toHaveLength(0);
  act(() => hookItem.current.attributeHook.destroyAttribute(formID));
  expect(hookItem.current.attributeHook.attributes[formID]).toBeUndefined();
});

test("attribute manager hook preset/gather test", () => {
  const { result: hookItem } = renderHook(() => useAttributeManager());
  act(() => hookItem.current.formHook.addForm({
    levels: [
      { id: 1, name: 'preset_level', required: true },
      { id: 2, name: 'preset_child_level', required: true, multiple: true }
    ],
    attributes: [{
      id: 3,
      path: '0',
      name: 'preset_attribute',
      children: [
        { id: 4, path: '0_0', name: 'preset_child_attr', children: [] }
      ]
    }]
  }));
  let formID = Object.keys(hookItem.current.formHook.forms)[0];
  expect(Object.keys(hookItem.current.formHook.forms)).toHaveLength(1);
  expect(hookItem.current.levelHook.levels[formID]).toHaveLength(2);
  expect(hookItem.current.attributeHook.attributes[formID]).toHaveLength(1);
  expect(hookItem.current.attributeHook.attributes[formID][0].children).toHaveLength(1);
  expect(hookItem.current.formHook.gatherAttributes()).toEqual([
    {
      "attributes": [
        {
          "children": [
            {"children": [], "id": 4, "name": "preset_child_attr", "path": "0_0"}
          ],
          "id": 3,
          "name": "preset_attribute",
          "path": "0"
        }
      ],
      "levels": [
        {"id": 1, "name": "preset_level", "order": 0, "required": true},
        {"id": 2, "multiple": true, "name": "preset_child_level", "order": 0, "required": true}
      ]
    }
  ]);
  expect(hookItem.current.formHook.gatherAttributes(3)).toEqual([
    {
      "attributes": [
        {
          "children": [
            {"children": [], "id": 4, "name": "preset_child_attr", "path": "0_0"}
          ],
          "id": 3,
          "name": "preset_attribute",
          "path": "0"
        }
      ],
      "levels": [
        {"id": 1, "name": "preset_level", "order": 3, "required": true},
        {"id": 2, "multiple": true, "name": "preset_child_level", "order": 3, "required": true}
      ]
    }
  ]);
  act(() => hookItem.current.formHook.clearForms());
  expect(hookItem.current.formHook.forms).toEqual({});
  act(() => hookItem.current.formHook.boundAttributes(mock_prepared_attributes));
  formID = Object.keys(hookItem.current.formHook.forms)[0];
  expect(Object.keys(hookItem.current.formHook.forms)).toHaveLength(2);
  expect(hookItem.current.levelHook.levels[formID]).toHaveLength(3);
  expect(hookItem.current.attributeHook.attributes[formID]).toHaveLength(2);
  expect(hookItem.current.attributeHook.attributes[formID][0].children).toHaveLength(2);
  expect(hookItem.current.attributeHook.attributes[formID][0].children[0].children).toHaveLength(1);
});