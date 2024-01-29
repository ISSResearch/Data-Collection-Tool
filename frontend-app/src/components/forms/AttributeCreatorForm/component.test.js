import { fireEvent, render, renderHook, screen, act } from '@testing-library/react';
import AttributeCreatorForm from '.';
import useAttributeManager from '../../../hooks/attributeManager';
import { AlertContext } from '../../../context/Alert';
import { MemoryRouter } from "react-router-dom";
import { prepared_attributes } from '../../../config/mock_data';

test("attribute creator form component test", () => {
  const { result: attributeManager } = renderHook(() => useAttributeManager());

  const component = () => (
    <MemoryRouter>
      <AlertContext.Provider value={{addAlert: () => {}}}>
        <AttributeCreatorForm attributeManager={attributeManager.current} />
      </AlertContext.Provider>
    </MemoryRouter>
  );
  const { rerender, container } = render(component());

  expect(Object.keys(attributeManager.current.formHook.forms)).toHaveLength(0);
  expect(screen.queryByText('Add Attribute')).not.toBeNull();
  expect(container.querySelector(".iss__findandreplace__form")).toBeNull();

  fireEvent.click(screen.getByText('Add Attribute'));
  fireEvent.click(screen.getByText('Add Attribute'));

  rerender(component());

  expect(Object.keys(attributeManager.current.formHook.forms)).toHaveLength(2);
  expect(screen.getAllByText('Levels:')).toHaveLength(2);
  expect(container.querySelector(".iss__findandreplace__form")).not.toBeNull();
});

test("attribute creator form component with bounds test", () => {
  const { result: attributeManager } = renderHook(() => useAttributeManager());

  const component = () => (
    <MemoryRouter>
      <AlertContext.Provider value={{addAlert: () => {}}}>
        <AttributeCreatorForm
          attributeManager={attributeManager.current}
          withBoundAttributes={prepared_attributes}
        />
      </AlertContext.Provider>
    </MemoryRouter>
  );

  const { rerender } = render(component());

  expect(screen.queryByText('Add Attribute')).toBeNull();
  expect(Object.keys(attributeManager.current.formHook.forms)).toHaveLength(3);

  rerender(component());

  expect(screen.getAllByText('Levels:')).toHaveLength(3);
});
