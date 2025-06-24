import { render, act } from '@testing-library/react';
import { Provider, useDispatch } from 'react-redux';
import { addAlert } from '../../slices/alerts';
import createStore from "../../store";
import AlertManager from '.';

test("alert manager component test", () => {
  const max = 6;
  var adder;
  const component = () => {
    const Inner = () => {
      const dispatch = useDispatch();
      adder = () => dispatch(addAlert({}));
      return <AlertManager maxOnScreen={max}/>;
    };
    return <Provider store={createStore()}><Inner/></Provider>;
  };

  const { container } = render(component());

  expect(container.querySelectorAll(".alertCard")).toHaveLength(0);
  act(() => {
    for (var i=0; i < 10; i++) adder();
  });

  render(component());
  expect(container.querySelectorAll(".alertCard")).toHaveLength(max);
});
