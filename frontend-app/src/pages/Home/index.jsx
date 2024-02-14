import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** @returns {undefined} */
export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/projects');
  }, []);
}
