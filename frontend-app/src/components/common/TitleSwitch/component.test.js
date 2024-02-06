import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'
import TitleSwitch from '.';

function test_selected_option(options, current, parentLink, titleLink) {
  var title = screen.getByRole('heading');
  var [titleChild] = title.children;

  expect(titleChild.innerHTML).toBe('Test Title');
  expect(titleChild.tagName).toBe(titleLink ? 'A' : 'SPAN');
  if (titleLink) expect(titleChild.href).toBe('http://localhost/' + parentLink);

  var linkSet = Array.from(screen.getByRole('navigation').children[0].children);

  expect(linkSet.map(({firstChild}) => firstChild.href ))
    .toEqual(options.map(({ link }) => `http://localhost/${parentLink}/${link}`));
  expect(linkSet.map(({firstChild}) => firstChild.innerHTML ))
    .toEqual(options.map(({ name }) => name));

  options.forEach(({ link, name }) => {
    expect(screen.getByText(name).className)
      .toBe(
        current == link
          ? 'iss__titleSwitch__navItem--active'
          : 'iss__titleSwitch__navItem'
      );
  });
}

test("title switch component test", () => {
  const options = [
    { name: 'upload data', link: 'upload' },
    { name: 'validate data', link: 'validate' },
    { name: 'download data', link: 'download' },
  ];
  const component = (tLink, route) => <MemoryRouter>
    <TitleSwitch
      title='Test Title'
      titleLink={tLink}
      links={options}
      currentRoute={route}
      parent='projects/1'
    />
  </MemoryRouter>

  const { rerender } = render(component(true, "upload"));
  test_selected_option(options, 'upload', 'projects/1', true);

  rerender(component(false, "upload"));
  test_selected_option(options, 'upload', 'projects/1', false);

  rerender(component(false, "edit"));
  test_selected_option(options, 'edit', 'projects/1', false);
});
