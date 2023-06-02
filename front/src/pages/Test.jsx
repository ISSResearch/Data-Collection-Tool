import { useMemo, useEffect, useState, memo, useCallback } from "react";

export default function Test() {
  const [preset, setPreset] = useState(null);
  const [cards, setCards] = useState([])
  let [count, setCount] = useState(0);

  const pushPreset = () => setPreset([1,2,3,4])

  const addCard = () => setCards(p => [...p, {id: Math.ceil(Math.random()*100)}]);
  // const delCard =  (delid) => setCards(prev => [...prev.filter(({id}) => id != delid)]);
  const delCard =  (delid) => setCards(prev => prev.filter(({id}) => id != delid));

  return (
    <>
      <button onClick={() => setCount(count += 1)}>count up</button>
      <span>{count}</span>
      <button onClick={addCard}>new card</button>
      <button onClick={pushPreset}>set</button>
      <div style={{display: 'flex', gap: '20px'}}>
        {cards.map((e) => <Card key={e.id} del={delCard} id={e.id} st={preset}/>)}
      </div>
    </>
  )
}


const Card = memo(({del, id, st}) => {
  console.log('render')
  const [values, setValues] = useState([]);
  const [moded, setModed] = useState(false);

  const handlePreset = (preset) => setValues(preset)
  const addValues = () => {
    setModed(true);
    if (moded) setValues([...values, values.length]);
    else setValues([0])
  }

  useEffect(() => {
    if (st) handlePreset([...st]);
  }, [st]);

  return (<div style={{display: 'flex', gap: '12px', flexDirection: 'column'}}>
    <span>name-{id}</span>
    {values.map(val => <span key={val}>e-{val}</span>)}
    <button onClick={addValues}>inc</button>
    <button onClick={() => del(id)}>del</button>
  </div>);
}
)