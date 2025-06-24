import { renderHook, act } from '@testing-library/react';
import useCollectors from '../collectorsHook';
import { raw_collectors } from '../../config/mock_data';

test("colletors hook test", () => {
  const { result: hook } = renderHook(() => useCollectors());

  expect(hook.current.collectors).toEqual({});

  act(() => hook.current.initData(raw_collectors));

  expect((hook.current.collectors)).toEqual(
    raw_collectors.reduce((acc, collector) => {
      var { id, username, permissions } = collector;
      acc[id] = { user_id: id, username, permissions };
      return acc;
    }, {})
  );

  act(() => {
    hook.current.changeCollector(raw_collectors[0].id, 'view', {checked: false});
    hook.current.changeCollector(raw_collectors[0].id, 'upload', {checked: true});
    hook.current.changeCollector(raw_collectors[1].id, 'upload', {checked: true});
  });

  expect(hook.current.collectors[raw_collectors[0].id].permissions.view).toBeFalsy();
  expect(hook.current.collectors[raw_collectors[0].id].permissions.upload).toBeTruthy();
  expect(hook.current.collectors[raw_collectors[1].id].permissions.upload).toBeTruthy();

  var gatherData = hook.current.gatherData();

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
