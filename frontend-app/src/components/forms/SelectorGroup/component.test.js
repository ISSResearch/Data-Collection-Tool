import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import useFileInput from '../../../../hooks/fileInput';
import useFile from '../../../../hooks/file';
import SelectGroup from '../../../../components/common/ui/SelectGroup';
import {
  mock_prepared_attributes,
  mock_apply_groups,
  mock_prepared_files
} from '../../../_mock';

test("select group component test", () => {
  render(
    <SelectGroup
      attributes={mock_prepared_attributes}
      handleApply={() => { }}
      isFiles={false}
    />
  );

  expect(screen.getByRole('group').className).toBe('iss__selectGroup');
  expect(screen.getAllByText('delete group')).toHaveLength(1);
  expect(screen.getAllByText('-not set-')).toHaveLength(2);
  expect(screen.getAllByText('apply to all')).toHaveLength(1);
  expect(screen.getByText('apply to all').className).toBe('iss__selectGroup__button button--disabled');

  fireEvent.click(screen.getByText('add object'));

  expect(screen.getAllByText('delete group')).toHaveLength(2);
  expect(screen.getAllByText('-not set-')).toHaveLength(4);

  render(
    <SelectGroup
      attributes={mock_prepared_attributes}
      handleApply={() => { }}
      isFiles={true}
    />
  );

  expect(screen.getAllByText('apply to all')[1].className).toBe('iss__selectGroup__button');
  expect(screen.getAllByText('delete group')).toHaveLength(3);

  fireEvent.click(screen.getAllByText('delete group')[0]);
  expect(screen.getAllByText('delete group')).toHaveLength(2);
  fireEvent.click(screen.getAllByText('delete group')[0]);
  fireEvent.click(screen.getAllByText('delete group')[0]);
  expect(screen.queryAllByText('delete group')).toHaveLength(0);
});


test("select group component test, case fileUploadCard", () => {
  const { result: filesManager } = renderHook(() => useFileInput());
  act(() => {
    filesManager.current.handleUpload([
      { file: '', name: `file1.png`, type: 'image/png' }
    ]);
  });
  const fileID = Object.keys(filesManager.current.files)[0];

  render(
    <SelectGroup
      attributes={mock_prepared_attributes}
      applyGroups={mock_apply_groups}
      fileID={fileID}
      setAttributeGroups={filesManager.current.setAttributeGroups}
    />
  );

  expect(filesManager.current.files[fileID].attributeGroups).toEqual(mock_apply_groups);
  expect(screen.getByRole('group').className).toBe('iss__selectGroup style--min');
  expect(screen.queryByText('apply to all')).toBe(null);
  expect(screen.getAllByText('delete group')).toHaveLength(1);
  fireEvent.click(screen.getByText('delete group'));
  expect(screen.queryAllByText('delete group')).toHaveLength(0);

  fireEvent.click(screen.getByText('add object'));
  expect(screen.queryAllByText('delete group')).toHaveLength(1);
});

test("select group component test, case fileInfo", () => {
  const { result: fileManager } = renderHook(() => useFile());
  act(() => fileManager.current.initFile(mock_prepared_files[0]));
  render(
    <SelectGroup
      attributes={mock_prepared_attributes}
      applyGroups={fileManager.current.file.attributeGroups}
      fileIndex={0}
      setAttributeGroups={fileManager.current.setAttributeGroups}
    />
  );

  expect(screen.getByRole('group').className).toBe('iss__selectGroup style--min');
  expect(screen.queryByText('apply to all')).toBe(null);
  expect(screen.getAllByText('delete group')).toHaveLength(1);
  fireEvent.click(screen.getByText('delete group'));
  expect(screen.queryAllByText('delete group')).toHaveLength(0);

  fireEvent.click(screen.getByText('add object'));
  expect(screen.queryAllByText('delete group')).toHaveLength(1);
});
