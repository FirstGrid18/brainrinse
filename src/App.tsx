import { useState } from 'react'
import Shell from './components/Shell'

export default function App() {
  const [lightMode, setLightMode] = useState(false)

  const toggleLight = () => {
    setLightMode(v => !v)
    document.body.classList.toggle('light')
  }

  return <Shell lightMode={lightMode} onToggleLight={toggleLight} />
}
