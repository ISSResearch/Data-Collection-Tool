import { renderHook, act } from '@testing-library/react';
import useAlerts from '../alertManager';

test("alert manager test", () => {
  const check = (message, type, session=false) => {
    const { result: hook } = renderHook(() => useAlerts());
    expect(hook.current.alerts).toEqual({});
    act(() => hook.current.addAlert(message, type, session));

    expect(Object.keys(hook.current.alerts).length).toBe(1);

    var [item] = Object.entries(hook.current.alerts);
    var [key, value] = item;

    if (!session) expect(value).toEqual({ active: true, message, type });
    else expect(value).toEqual({
      active: true,
      message: "Session expired",
      type: "common"
    });

    act(() => hook.current.removeAlert(key));
    expect(hook.current.alerts[key].active).toBeFalsy();
  }

  check("some", "type");
  check("zxc", "asd", true);
})
