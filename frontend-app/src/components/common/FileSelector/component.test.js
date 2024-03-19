import { fireEvent, render, renderHook, screen, act } from '@testing-library/react';
import FileSelector from '.';
import { useFiles, useSwiper } from '../../../hooks';
import { raw_files } from '../../../config/mock_data';

test("file selector component test", () => {
  const { result: filesHook } = renderHook(() => useFiles());
  const { result: swiperHook } = renderHook(() => useSwiper());

  act(() => {
    filesHook.current.initFiles(raw_files);
    swiperHook.current.setMax(raw_files.length);
  });

  const change = (_, page) => {
    act(() => swiperHook.current.setPagination((prev) => {
      return {...prev, page};
    }));
  };
  component = () => <FileSelector
    fileManager={filesHook.current}
    sliderManager={swiperHook.current}
    onChange={change}
  />;

  const { container, rerender } = render(component());

  expect(screen.getAllByRole('heading')).toHaveLength(raw_files.length);
  expect(container.querySelector(".iss__fileSelector__pagination")).toBeNull();
  act(() => {
    swiperHook.current.setPagination(
      { page: 1, totalPages: 3 }
    );
  });

  rerender(component());
  expect(container.querySelector(".iss__fileSelector__pagination")).not.toBeNull();
  expect(screen.getByRole("spinbutton").value).toBe("1");
  expect(container.querySelectorAll(".nav--block")).toHaveLength(1);
  fireEvent.blur(screen.getByRole("spinbutton"), {target: {value: "3"}});
  expect(screen.getByRole("spinbutton").value).toBe("3");
  expect(container.querySelectorAll(".nav--block")).toHaveLength(1);
  rerender(component());
  fireEvent.click(container.querySelector("svg"));
  rerender(component());
  expect(container.querySelectorAll(".nav--block")).toHaveLength(0);
});
