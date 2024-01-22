import { fireEvent, act, render, renderHook, screen } from '@testing-library/react';
import AttributeInput from '.';
import { useAttributeManager, useAlerts } from '../../../hooks';
import { MemoryRouter } from 'react-router-dom';
import { AlertContext } from '../../../context/Alert';
import { prepared_attributes } from '../../../config/mock_data';

test("attribute input component test", () => {
  const { result: hook } = renderHook(() => useAttributeManager());
  const { result: alerts } = renderHook(() => useAlerts());

  act(() => hook.current.formHook.boundAttributes(prepared_attributes.slice(0, 1)));
  const [firstForm] = Object.keys(hook.current.formHook.forms);

  var attributes = [];
  var attributesStack = [...hook.current.attributeHook.attributes[firstForm]];
  while (attributesStack.length) {
    var item = attributesStack.pop();
    attributes.push(item);
    if (item.children) attributesStack.push(...item.children);
  }

  const { rerender } = render(
    <MemoryRouter>
      <AlertContext.Provider value={ alerts }>
        <AttributeInput
          formId={firstForm}
          attributes={hook.current.attributeHook.attributes[firstForm]}
          depth={hook.current.levelHook.levels[firstForm].length}
          delAttribute={hook.current.attributeHook.delAttribute}
          addAttribute={hook.current.attributeHook.addAttribute}
          handleChange={hook.current.attributeHook.handleChange}
          setDeletedOriginAttributes={hook.current.attributeHook.setDeletedOriginAttributes}
          // moveUp={}
          // moveDown={}
        />
        </AlertContext.Provider>
    </MemoryRouter>
  );

  expect(screen.queryAllByText('confirm')).toHaveLength(0);
  expect(screen.getAllByText('------|'))
    .toHaveLength(attributes.length - hook.current.attributeHook.attributes[firstForm].length);
  expect(screen.getAllByRole('textbox')).toHaveLength(attributes.length);
  attributes.forEach(({ name, parent }) => {
    var parentElement = screen.getByDisplayValue(name).parentNode.parentNode;
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

  rerender(
    <MemoryRouter>
      <AlertContext.Provider value={ alerts }>
        <AttributeInput
          formId={firstForm}
          attributes={hook.current.attributeHook.attributes[firstForm]}
          depth={hook.current.levelHook.levels[firstForm].length}
          delAttribute={hook.current.attributeHook.delAttribute}
          addAttribute={hook.current.attributeHook.addAttribute}
          handleChange={hook.current.attributeHook.handleChange}
          setDeletedOriginAttributes={hook.current.attributeHook.setDeletedOriginAttributes}
        />
    </AlertContext.Provider>
    </MemoryRouter>
  );

  expect(screen.getAllByRole('textbox')).toHaveLength(attributes.length + 1);

  expect(screen.getAllByRole('button')).toHaveLength(
    (1 + attributes.length) * 2 - attributes.filter(({children}) => !children.length).length
  );

  fireEvent.blur(screen.getByDisplayValue(''), { target: { value: 'new_test' } });

  rerender(
    <MemoryRouter>
      <AlertContext.Provider value={ alerts }>
        <AttributeInput
          formId={firstForm}
          attributes={hook.current.attributeHook.attributes[firstForm]}
          depth={hook.current.levelHook.levels[firstForm].length}
          delAttribute={hook.current.attributeHook.delAttribute}
          addAttribute={hook.current.attributeHook.addAttribute}
          handleChange={hook.current.attributeHook.handleChange}
          setDeletedOriginAttributes={hook.current.attributeHook.setDeletedOriginAttributes}
        />
    </AlertContext.Provider>
    </MemoryRouter>
);

  screen.getByDisplayValue('new_test');

  fireEvent.click(screen.getAllByRole('button')[8]);

  rerender(
    <MemoryRouter>
      <AlertContext.Provider value={ alerts }>
        <AttributeInput
          formId={firstForm}
          attributes={hook.current.attributeHook.attributes[firstForm]}
          depth={hook.current.levelHook.levels[firstForm].length}
          delAttribute={hook.current.attributeHook.delAttribute}
          addAttribute={hook.current.attributeHook.addAttribute}
          handleChange={hook.current.attributeHook.handleChange}
          setDeletedOriginAttributes={hook.current.attributeHook.setDeletedOriginAttributes}
        />
    </AlertContext.Provider>
    </MemoryRouter>
);

  expect(screen.queryByDisplayValue('new_test')).toBeNull();

  fireEvent.click(screen.getAllByRole('button')[0]);

  rerender(
    <MemoryRouter>
      <AlertContext.Provider value={ alerts }>
        <AttributeInput
          formId={firstForm}
          attributes={hook.current.attributeHook.attributes[firstForm]}
          depth={hook.current.levelHook.levels[firstForm].length}
          delAttribute={hook.current.attributeHook.delAttribute}
          addAttribute={hook.current.attributeHook.addAttribute}
          handleChange={hook.current.attributeHook.handleChange}
          setDeletedOriginAttributes={hook.current.attributeHook.setDeletedOriginAttributes}
        />
    </AlertContext.Provider>
    </MemoryRouter>
);

  expect(screen.queryAllByText('confirm')).toHaveLength(1);
});
