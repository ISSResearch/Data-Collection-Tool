import { renderHook, act } from '@testing-library/react';
import useCollectors from '../../hooks/collectorsHook';
import { mock_raw_collectors } from '../_mock';

test("colletors hook test", () => {
  const { result: hookItem } = renderHook(() => useCollectors());

  expect(hookItem.current.collectors).toEqual({});

  act(() => hookItem.current.initData(mock_raw_collectors));

  expect((hookItem.current.collectors)).toEqual(
    mock_raw_collectors.reduce((acc, collector) => {
      const { id, username, permissions } = collector;
      acc[id] = { user_id: id, username, permissions };
      return acc;
    }, {})
  );

  act(() => {
    hookItem.current.changeCollector(mock_raw_collectors[0].id, 'view', {checked: false});
    hookItem.current.changeCollector(mock_raw_collectors[0].id, 'upload', {checked: true});
    hookItem.current.changeCollector(mock_raw_collectors[1].id, 'upload', {checked: true});
  });

  expect(hookItem.current.collectors[mock_raw_collectors[0].id].permissions.view).toBeFalsy();
  expect(hookItem.current.collectors[mock_raw_collectors[0].id].permissions.upload).toBeTruthy();
  expect(hookItem.current.collectors[mock_raw_collectors[1].id].permissions.upload).toBeTruthy();

  const gatherData = hookItem.current.gatherData();

  expect(gatherData).toEqual([
    {
      user_id: 12,
      username: 'test',
      permissions: {
        view: false,
        upload: true,
        validate: false,
        stats: false,
        download: false,
        edit: false
      }
    },
    {
      user_id: 13,
      username: 'some',
      permissions: {
        view: false,
        upload: true,
        validate: false,
        stats: false,
        download: true,
        edit: false
      }
    }
  ]);
});