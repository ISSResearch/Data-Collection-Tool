import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { useState } from 'react';
import TitleSwitch from '../../../components/common/TitleSwitch';

function test_selected_option(options, current) {
  expect(screen.getByRole('heading').innerHTML).toBe('Test Title');
  expect(Array.from(screen.getAllByRole('radio')).map(({value}) => value))
    .toEqual(options.map(({ value }) => value));

  options.forEach(({value, name}) => {
    expect(screen.getByText(name).className)
      .toBe(
        current == value
          ? 'iss__titleSwitch__radioItem--active'
          : 'iss__titleSwitch__radioItem'
      );
  });
}

test("title switch component test", () => {
  const options = [
    { name: 'upload data', value: 'upload' },
    { name: 'validate data', value: 'validate' },
    { name: 'download data', value: 'download' },
  ];

  const { result: hookItem } = renderHook(() => {
    const [pageOption, setOption] = useState(options[0].value);
    return { pageOption, setOption };
  });

  render(
    <TitleSwitch
      title={'Test Title'}
      options={options}
      currentOption={hookItem.current.pageOption}
      handler={hookItem.current.setOption}
    />
  );

  expect(hookItem.current.pageOption).toBe(options[0].value);
  test_selected_option(options, hookItem.current.pageOption);
  fireEvent.change(screen.getByRole('group', { target: {value: options[1].value}}));
  test_selected_option(options, hookItem.current.pageOption);
});

