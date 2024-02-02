import { render, renderHook, act } from '@testing-library/react';
import { AlertContext } from '../../context/Alert';
import AlertManager from '.';
import { useAlerts } from "../../hooks";

test("alert manager component test", () => {
  const { result: alerts } = renderHook(() => useAlerts());
  const max = 6;
  const component = () => (
    <AlertContext.Provider value={alerts.current}>
      <AlertManager maxOnScreen={6}/>
    </AlertContext.Provider>
  );

  const { rerender, container } = render(component())

  expect(container.querySelectorAll(".alertCard")).toHaveLength(0);
  act(() => {
    for (var i=0; i < 10; i++) alerts.current.addAlert("", "", true);
  });

  rerender(component());
  expect(container.querySelectorAll(".alertCard")).toHaveLength(6);
});
