import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  async function Example(){
    const counter = new URLSearchParams({ count: count.toString() }).toString();

    const response = await fetch(`api/example?${counter}`);
    const data = await response.json()
    
    setCount(data.count)
  } 


  return (
    <>
      <section id="center">
        <button
          type="button"
          className="counter"
          onClick={Example}
        >
          Count is {count}
        </button>
      </section>
    </>
  )
}

export default App
