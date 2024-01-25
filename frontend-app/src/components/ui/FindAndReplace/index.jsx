import { useState, useRef } from "react";
import "./styles.css";

const ERROR_CLASS = "input--error";

export default function FindAndReplace({ onCommit }) {
  const [isActive, setIsActive] = useState(false);
  const replaceTo = useRef(null);
  const replaceWith = useRef(null);

  function toggle() {
    setIsActive(prev => {
      if (prev) {
        replaceTo.current.value = "";
        replaceWith.current.value = "";
        return false;
      }
      return true;
    });
  }

  function removeError({target}) {
    target.classList.remove(ERROR_CLASS);
  }

  function warn(element) {
    element.current.classList.add(ERROR_CLASS);
    setTimeout(() => element.current.classList.remove(ERROR_CLASS), 2000);
  }

  function validate(toValue, withValue) {
    if (!toValue && !withValue) return "close";
    if (toValue && withValue) return "valid";
    warn(toValue ? replaceWith : replaceTo);
  }

  function handleSubmit() {
    var { value: toValue } = replaceTo.current;
    var { value: withValue } = replaceWith.current;

    toValue = toValue.trim();
    withValue = withValue.trim();

    var validateMap = {
      valid: () => {
        onCommit(toValue, withValue);
        toggle();
      },
      close: () => toggle()
    }

    var validattionCallback = validateMap[validate(toValue, withValue)];
    if (validattionCallback) validattionCallback();
  }

  return (
    <div
      className={
        "iss__findandreplace__form" + (isActive ? " form--open" : "")
      }
    >
      <button
        type="button"
        onClick={() => toggle()}
        className={
          "iss__findandreplace__button" + (isActive ? " button--cancel" : "")
        }
      >{isActive ? "cancel" : "replace word"}</button>
      <input
        disabled={!isActive}
        onFocus={removeError}
        ref={replaceTo}
        placeholder="replace to"
      />
      <input
        disabled={!isActive}
        onFocus={removeError}
        ref={replaceWith}
        placeholder="replace with"
      />
      <button
        type="button"
        disabled={!isActive}
        onClick={handleSubmit}
        className="iss__findandreplace__button button--proceed"
      >proceed</button>
    </div>
  );
}
