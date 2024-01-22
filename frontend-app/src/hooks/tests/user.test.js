import { renderHook, act } from '@testing-library/react';
import useUser from '../user';

test("user hook test", () => {
  const { result: hook } = renderHook(() => useUser());

  var userData =  {name: "some", some: 123};

  expect(hook.current.user).toBeNull();

  act(() => hook.current.initUser(userData));
  expect(hook.current.user).toEqual(userData);
});
