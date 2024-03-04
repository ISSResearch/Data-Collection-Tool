import { renderHook, act } from '@testing-library/react';
import { useAlerts, Alert } from '../alertManager';

test("alert manager test", () => {
  const check = (message, type, session=false) => {
    const { result: hook } = renderHook(() => useAlerts());
    expect(hook.current.alerts).toEqual({});
    act(() => hook.current.addAlert(message, type, session));

    expect(Object.keys(hook.current.alerts)).toHaveLength(1);

    var [item] = Object.entries(hook.current.alerts);
    var [key, value] = item;
    var _alert = new Alert(message, type);
    _alert.id = key;

    _alert.id = value.id;
    if (!session) expect(value).toEqual(_alert);
    else expect(value).toEqual({
      id: value.id,
      active: true,
      message: "Session expired",
      type: "common"
    });

    act(() => hook.current.removeAlert(key));
    expect(hook.current.alerts[key].active).toBeFalsy();
  };

  check("some", "type");
  check("zxc", "asd", true);
});
