import { ReactElement, useEffect } from "react";
import { setNav, setTitle, setParent, setCurrent, setLink } from "../../slices/heads";
import { useDispatch } from "react-redux";

/** @returns {ReactElement} */
export default function Blank() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setNav());
    dispatch(setParent());
    dispatch(setCurrent());
    dispatch(setLink());
    dispatch(setTitle("Not Found"));
  }, []);

  return <>Not Found</>;
}
