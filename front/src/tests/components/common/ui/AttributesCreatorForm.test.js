import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import AttributeCreatorForm from '../../../../components/common/ui/AttributeCreatorForm';
import useAttributeManager from '../../../../hooks/attributeManager';
import { mock_prepared_attributes } from '../../../_mock';

test("attribute creator form component test", () => {
  const { result: attributeManager } = renderHook(() => useAttributeManager());
  const { getByText } = render(<AttributeCreatorForm attributeManager={attributeManager.current}/>);
  expect(Object.keys(attributeManager.current.formHook.forms)).toHaveLength(0);
  expect(screen.queryByText('Add Attribute')).not.toBeNull();
  fireEvent.click(getByText('Add Attribute'));
  expect(Object.keys(attributeManager.current.formHook.forms)).toHaveLength(1);
  // TODO: fragment doesnt rerenders
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
});