import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useFileInput, useFile } from "../../../hooks";
import SelectGroup from '.';
import {
  prepared_attributes,
  apply_groups,
  prepared_files
} from '../../../config/mock_data';

afterEach(() => {
  jest.restoreAllMocks();
});

test("select group component base test", () => {
  render(<SelectGroup attributes={prepared_attributes} handleApply={() => {}} />);

  expect(screen.getByRole('group').className).toBe('iss__selectGroup');
  expect(screen.getAllByRole("button", {name:'delete group'})).toHaveLength(1);
  expect(screen.queryAllByRole("button", {name: "copy group"})).toHaveLength(0)
  expect(screen.getAllByText('-not set-')).toHaveLength(3);
  expect(screen.getByRole("button", {name:'apply to all'}).className).toBe('iss__selectGroup__button button--disabled');

  fireEvent.click(screen.getByText('add object'));
  expect(screen.getAllByRole("button", {name: 'delete group'})).toHaveLength(2);
  expect(screen.getAllByText('-not set-')).toHaveLength(6);
  fireEvent.click(screen.getAllByRole("button", {name:'delete group'})[0]);
  expect(screen.getAllByText('delete group')).toHaveLength(1);
  fireEvent.click(screen.getAllByText('delete group')[0]);
  expect(screen.queryAllByText('delete group')).toHaveLength(0);
});

test("select group component base test with preset", () => {
  render(<SelectGroup
    attributes={prepared_attributes}
    attributeGroups={apply_groups}
    fileID={1}
    isFiles={true}
    handleApply={() => {}}
  />);

  expect(screen.getByRole('group').className).toBe('iss__selectGroup style--min');
  expect(screen.getAllByRole("button", {name:'delete group'})).toHaveLength(1);
  expect(screen.queryAllByRole("button", {name: "copy group"})).toHaveLength(1)
  expect(screen.getAllByText('-not set-')).toHaveLength(4);
  expect(screen.getByRole("button", {name:'apply to all'}).className).toBe('iss__selectGroup__button');
});

test("select group component test, case fileUploadCard", () => {
  const { result: filesManager } = renderHook(() => useFileInput());
  global.URL.createObjectURL = () => "";
  act(() => {
    filesManager.current.handleUpload([
      { file: '', name: `file1.png`, type: 'image/png' }
    ]);
  });
  act(() => filesManager.current.handleApplyGroups(apply_groups))
  const fileID = Object.keys(filesManager.current.files)[0];

  const component = () => (
    <SelectGroup
      attributes={prepared_attributes}
      attributeGroups={filesManager.current.files[fileID].attributeGroups}
      fileID={fileID}
      setAttributeGroups={filesManager.current.setAttributeGroups}
      handleGroupChange={filesManager.current.handleGroupChange}
    />
  );

  const { rerender } = render(component());

  expect(filesManager.current.files[fileID].attributeGroups).toEqual(apply_groups);
  expect(screen.getByRole('group').className).toBe('iss__selectGroup style--min');
  expect(screen.queryByText('apply to all')).toBe(null);
  expect(screen.getAllByText('delete group')).toHaveLength(1);
  expect(screen.getAllByText('copy group')).toHaveLength(1);

  fireEvent.click(screen.getByText('copy group'));

  rerender(component())

  expect(screen.getAllByText('delete group')).toHaveLength(2);

  fireEvent.click(screen.getAllByRole("button", {name:'delete group'})[0]);

  rerender(component())
  expect(screen.queryAllByText('delete group')).toHaveLength(1);
});
