import { fireEvent, render, renderHook, screen, act } from '@testing-library/react';
import AttributeCreatorForm from '../../../../components/common/ui/AttributeCreatorForm';
import useAttributeManager from '../../../../hooks/attributeManager';
import { mock_prepared_attributes } from '../../../_mock';

test("attribute creator form component test", () => {
  const { result: attributeManager } = renderHook(() => useAttributeManager());
  render(<AttributeCreatorForm attributeManager={attributeManager.current}/>);

  expect(Object.keys(attributeManager.current.formHook.forms)).toHaveLength(0);
  expect(screen.queryByText('Add Attribute')).not.toBeNull();

  fireEvent.click(screen.getByText('Add Attribute'));
  fireEvent.click(screen.getByText('Add Attribute'));

  render(<AttributeCreatorForm attributeManager={attributeManager.current}/>);

  expect(Object.keys(attributeManager.current.formHook.forms)).toHaveLength(2);
  expect(screen.getAllByText('Levels:')).toHaveLength(2);

});

test("attribute creator form component with bounds test", () => {
  const { result: attributeManager } = renderHook(() => useAttributeManager());
  render(
    <AttributeCreatorForm
      attributeManager={attributeManager.current}
      withBoundAttributes={mock_prepared_attributes}
    />
  );

  expect(screen.queryByText('Add Attribute')).toBeNull();
  expect(Object.keys(attributeManager.current.formHook.forms)).toHaveLength(2);

  render(
    <AttributeCreatorForm
      attributeManager={attributeManager.current}
      withBoundAttributes={mock_prepared_attributes}
    />
  );

  expect(screen.getAllByText('Levels:')).toHaveLength(2);
});