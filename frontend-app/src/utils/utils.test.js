import {
  deepCopy,
  deepFind,
  refreshPath,
  compareArrays,
  findRequired,
  formError,
  spreadChildren
} from '../../utils/utils';
import {
  mock_object_with_inner_list,
  mock_list_with_objects,
  mock_deep_find,
  mock_prepared_attributes
} from '../_mock';

test("deep copy util test", () => {
  const preparedObject = deepCopy(mock_object_with_inner_list);
  const preparedList = deepCopy(mock_list_with_objects);
  preparedObject.newAttribute = 'test_data';
  preparedObject.attributes.push({ id: 111, name: 'new_test' });
  preparedList.push({ id: 111, name: 'new_test' });
  preparedList[0].name = 'check_test';

  expect(preparedObject).not.toEqual(mock_object_with_inner_list);
  expect(preparedObject.attributes).not.toEqual(mock_object_with_inner_list.attributes);
  expect(preparedList).not.toEqual(mock_list_with_objects);
});

test("deep find util test", () => {
  const path = ['1', '0', '1'];
  const target = deepFind(mock_deep_find, path);

  expect(target).toEqual({
    "id": 261,
    "name": "genc2",
    "parent": 259,
    "orig": true,
    "children": [],
    "path": "1_0_1"
  });
});

test("refresh path util test", () => {
  refreshPath(mock_list_with_objects, '0', 0);
  mock_list_with_objects.forEach(({ path }, index) => expect(path).toBe('0_' + index));
});

test("compare arrays util test", () => {
  const newArray = [...mock_list_with_objects, { id: 10, name: 'new name' }];

  expect(compareArrays(mock_list_with_objects, mock_list_with_objects)).toBeTruthy();
  expect(compareArrays(mock_list_with_objects, newArray)).toBeFalsy();
});

test("find required and form error utils test", () => {
  const required = findRequired(mock_prepared_attributes);
  const errorMessage = formError('file_name', required);
  expect(required).toEqual([
    {
      "id": 122,
      "attributes": [259, 262, 265, 268],
      "uid": 270544594389903,
      "name": "model",
      "multiple": null,
      "required": true,
      "order": 0,
      "parent": 117,
      "project": 23,
      "children": [
        {
          "id": 124,
          "attributes": [
            { "id": 260, "name": "genc1", "parent": 259 },
            { "id": 261, "name": "genc2", "parent": 259 },
            { "id": 263, "name": "gena1", "parent": 262 },
            { "id": 264, "name": "gena2", "parent": 262 },
            { "id": 267, "name": "gene2", "parent": 265 },
            { "id": 270, "name": "genf2", "parent": 268 }
          ],
          "uid": 9650426937781034,
          "name": "gen",
          "multiple": false,
          "required": true,
          "order": 0,
          "parent": 122,
          "project": 23
        }
      ]
    },
    {
      "id": 124,
      "attributes": [260, 261, 263, 264, 267, 270],
      "uid": 9650426937781034,
      "name": "gen",
      "multiple": false,
      "required": true,
      "order": 0,
      "parent": 122,
      "project": 23
    }
  ]);
  expect(errorMessage).toEqual(
    {
      "isValid": false,
      "message": "File \"file_name\" is missing required attributes: model, gen."
    }
  );
});

test("spread children util test", () => {
  const preparedData = spreadChildren(mock_deep_find);

  expect(preparedData).toEqual([
    {
      "id": 246,
      "name": "ford",
      "parent": null,
      "orig": true,
      "children": [
        {
          "id": 265,
          "name": "exp",
          "parent": 246,
          "orig": true,
          "children": [
            { "id": 267, "name": "gene2", "parent": 265, "orig": true, "children": [], "path": "0_0_0" }
          ],
          "path": "0_0"
        },
        {
          "id": 268,
          "name": "f150",
          "parent": 246,
          "orig": true,
          "children": [
            { "id": 270, "name": "genf2", "parent": 268, "orig": true, "children": [], "path": "0_1_0" }
          ],
          "path": "0_1"
        }
      ],
      "path": "0"
    },
    {
      "id": 249,
      "name": "honda",
      "parent": null,
      "orig": true,
      "children": [
        {
          "id": 259,
          "name": "civ",
          "parent": 249,
          "orig": true,
          "children": [
            { "id": 260, "name": "genc1", "parent": 259, "orig": true, "children": [], "path": "1_0_0" },
            { "id": 261, "name": "genc2", "parent": 259, "orig": true, "children": [], "path": "1_0_1" }
          ],
          "path": "1_0"
        },
        {
          "id": 262,
          "name": "acc",
          "parent": 249,
          "orig": true,
          "children": [
            { "id": 263, "name": "gena1", "parent": 262, "orig": true, "children": [], "path": "1_1_0" },
            { "id": 264, "name": "gena2", "parent": 262, "orig": true, "children": [], "path": "1_1_1" }
          ],
          "path": "1_1"
        }
      ],
      "path": "1"
    },
    {
      "id": 259,
      "name": "civ",
      "parent": 249,
      "orig": true,
      "children": [
        { "id": 260, "name": "genc1", "parent": 259, "orig": true, "children": [], "path": "1_0_0" },
        { "id": 261, "name": "genc2", "parent": 259, "orig": true, "children": [], "path": "1_0_1" }
      ],
      "path": "1_0"
    },
    {
      "id": 262,
      "name": "acc",
      "parent": 249,
      "orig": true,
      "children": [
        { "id": 263, "name": "gena1", "parent": 262, "orig": true, "children": [], "path": "1_1_0" },
        { "id": 264, "name": "gena2", "parent": 262, "orig": true, "children": [], "path": "1_1_1" }
      ],
      "path": "1_1"
    },
    { "id": 263, "name": "gena1", "parent": 262, "orig": true, "children": [], "path": "1_1_0" },
    { "id": 264, "name": "gena2", "parent": 262, "orig": true, "children": [], "path": "1_1_1" },
    { "id": 260, "name": "genc1", "parent": 259, "orig": true, "children": [], "path": "1_0_0" },
    { "id": 261, "name": "genc2", "parent": 259, "orig": true, "children": [], "path": "1_0_1" },
    {
      "id": 265,
      "name": "exp",
      "parent": 246,
      "orig": true,
      "children": [
        { "id": 267, "name": "gene2", "parent": 265, "orig": true, "children": [], "path": "0_0_0" }
      ],
      "path": "0_0"
    },
    {
      "id": 268,
      "name": "f150",
      "parent": 246,
      "orig": true,
      "children": [
        { "id": 270, "name": "genf2", "parent": 268, "orig": true, "children": [], "path": "0_1_0" }
      ],
      "path": "0_1"
    },
    { "id": 270, "name": "genf2", "parent": 268, "orig": true, "children": [], "path": "0_1_0" },
    { "id": 267, "name": "gene2", "parent": 265, "orig": true, "children": [], "path": "0_0_0" }
  ]);
});
