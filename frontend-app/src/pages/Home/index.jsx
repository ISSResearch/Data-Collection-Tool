import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setLink, setNav, setTitle, setParent, setCurrent } from '../../slices/heads';

/** @returns {void} */
export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    navigate('/projects');
    dispatch(setNav());
    dispatch(setParent());
    dispatch(setCurrent());
    dispatch(setLink());
    dispatch(setTitle("Home"));
  }, []);
}
