import { fireEvent, act, render, renderHook, screen } from '@testing-library/react';
import AttributeInput from '../../../components/common/AttributeInput';
import { useAttributeManager } from '../../../hooks';
import { mock_prepared_attributes } from '../../_mock';

test("attribute input component test", () => {
  const { result: managerHook } = renderHook(() => useAttributeManager());
  act(() => managerHook.current.formHook.boundAttributes(mock_prepared_attributes.slice(0, 1)));
  const [firstForm] = Object.keys(managerHook.current.formHook.forms);

  const attributes = [];
  const attributesStack = [...managerHook.current.attributeHook.attributes[firstForm]];
  while (attributesStack.length) {
    const item = attributesStack.pop();
    attributes.push(item);
    if (item.children) attributesStack.push(...item.children);
  }

  const { rerender} = render(<AttributeInput
    formId={firstForm}
    attributes={managerHook.current.attributeHook.attributes[firstForm]}
    depth={managerHook.current.levelHook.levels[firstForm].length}
    delAttribute={managerHook.current.attributeHook.delAttribute}
    addAttribute={managerHook.current.attributeHook.addAttribute}
    handleChange={managerHook.current.attributeHook.handleChange}
    setDeletedOriginAttributes={managerHook.current.attributeHook.setDeletedOriginAttributes}
  />);

  expect(screen.queryAllByText('confirm')).toHaveLength(0);
  expect(screen.getAllByText('------|'))
    .toHaveLength(attributes.length - managerHook.current.attributeHook.attributes[firstForm].length);
  expect(screen.getAllByRole('textbox')).toHaveLength(attributes.length);
  attributes.forEach(({ name, parent }) => {
    const parentElement = screen.getByDisplayValue(name).parentNode.parentNode;
    expect(parentElement.className).toBe(
      parent
        ? 'iss__attributeForm attribute--child'
        : 'iss__attributeForm'
    );
  });

  expect(screen.getAllByRole('button')).toHaveLength(
    attributes.length * 2 - attributes.filter(({children}) => !children.length).length
  );

  fireEvent.click(screen.getAllByRole('button')[1]);

  rerender(<AttributeInput
    formId={firstForm}
    attributes={managerHook.current.attributeHook.attributes[firstForm]}
    depth={managerHook.current.levelHook.levels[firstForm].length}
    delAttribute={managerHook.current.attributeHook.delAttribute}
    addAttribute={managerHook.current.attributeHook.addAttribute}
    handleChange={managerHook.current.attributeHook.handleChange}
    setDeletedOriginAttributes={managerHook.current.attributeHook.setDeletedOriginAttributes}
  />);

  expect(screen.getAllByRole('textbox')).toHaveLength(attributes.length + 1);

  expect(screen.getAllByRole('button')).toHaveLength(
    (1 + attributes.length) * 2 - attributes.filter(({children}) => !children.length).length
  );

  fireEvent.blur(screen.getByDisplayValue(''), { target: { value: 'new_test' } });

  rerender(<AttributeInput
    formId={firstForm}
    attributes={managerHook.current.attributeHook.attributes[firstForm]}
    depth={managerHook.current.levelHook.levels[firstForm].length}
    delAttribute={managerHook.current.attributeHook.delAttribute}
    addAttribute={managerHook.current.attributeHook.addAttribute}
    handleChange={managerHook.current.attributeHook.handleChange}
    setDeletedOriginAttributes={managerHook.current.attributeHook.setDeletedOriginAttributes}
  />);

  screen.getByDisplayValue('new_test');

  fireEvent.click(screen.getAllByRole('button')[8]);

  rerender(<AttributeInput
    formId={firstForm}
    attributes={managerHook.current.attributeHook.attributes[firstForm]}
    depth={managerHook.current.levelHook.levels[firstForm].length}
    delAttribute={managerHook.current.attributeHook.delAttribute}
    addAttribute={managerHook.current.attributeHook.addAttribute}
    handleChange={managerHook.current.attributeHook.handleChange}
    setDeletedOriginAttributes={managerHook.current.attributeHook.setDeletedOriginAttributes}
  />);

  expect(screen.queryByDisplayValue('new_test')).toBeNull();

  fireEvent.click(screen.getAllByRole('button')[0]);

  rerender(<AttributeInput
    formId={firstForm}
    attributes={managerHook.current.attributeHook.attributes[firstForm]}
    depth={managerHook.current.levelHook.levels[firstForm].length}
    delAttribute={managerHook.current.attributeHook.delAttribute}
    addAttribute={managerHook.current.attributeHook.addAttribute}
    handleChange={managerHook.current.attributeHook.handleChange}
    setDeletedOriginAttributes={managerHook.current.attributeHook.setDeletedOriginAttributes}
  />);

  expect(screen.queryAllByText('confirm')).toHaveLength(1);
});
