import {
  inputFilesAdapter,
  attributeAdapter,
  attributeGroupsAdapter,
} from '.';
import {
  raw_project,
  prepared_attributes,
  raw_file_attributes,
} from '../config/mock_data';

test("input files adapter test", () => {
  global.URL.createObjectURL = () => "someURL";
  var files = [new File([1], 'file1'), new File([2], 'file2')];
  var mockGroups = {1: [1,2,3], 2: [4,5,6]};
  const check = (item, groups) => {
    expect(Object.keys(item))
      .toEqual(["file", "blob", "attributeGroups", "name", "extension", "type"]);
    expect(item.attributeGroups).toEqual(groups);
  };

  var preparedNoGroups = inputFilesAdapter(files);
  var preparedWithGroups = inputFilesAdapter(files, mockGroups);

  check(preparedNoGroups[Object.keys(preparedNoGroups)[0]], {});
  check(preparedWithGroups[Object.keys(preparedWithGroups)[0]], mockGroups);
});

test("attribute adapter test", () => {
  var preparedAttributes = attributeAdapter(raw_project);
  expect(preparedAttributes.preparedAttributes).toEqual(prepared_attributes);
});

test("attribute groups adapter test", () => {
  var preparedGroups = attributeGroupsAdapter(raw_file_attributes);
  expect(preparedGroups).toEqual({
    '5738e31f-c43a-4195-b1c2-ea513424a309': { 0: [249, 259, 260], 1: [271] }
  });
});
