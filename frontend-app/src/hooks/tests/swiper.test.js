import { renderHook, act } from '@testing-library/react';
import useSwiper from '../swiper';

test("test swiper hook", () => {
  const { result: hookItem } = renderHook(() => useSwiper(3));

  expect(hookItem.current.slide).toBe(0);

  act(() => hookItem.current.setSlide(2));
  expect(hookItem.current.slide).toBe(2);

  act(() => hookItem.current.slideDec());
  expect(hookItem.current.slide).toBe(1);

  act(() => hookItem.current.slideInc());
  expect(hookItem.current.slide).toBe(2);

  act(() => hookItem.current.slideInc());
  expect(hookItem.current.slide).toBe(2);

  act(() => hookItem.current.slideDec());
  expect(hookItem.current.slide).toBe(1);

  act(() => hookItem.current.slideDec());
  expect(hookItem.current.slide).toBe(0);

  act(() => hookItem.current.slideDec());
  expect(hookItem.current.slide).toBe(0);

  act(() => {
    hookItem.current.setMax(5);
    hookItem.current.setSlide(4);
  });
  expect(hookItem.current.slide).toBe(4);
});
