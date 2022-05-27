import { useEffect, useState } from 'react';
import '../../css/App.css';
import NavigBar from './NavigBar';

function App() {
  const [transacts, setTransact] = useState(false);


  return (
    <div className="App">
      
      <header className="App-header">
      <h1 className='underline'>Hello123</h1>
      </header>
      <NavigBar/>
      
    </div>
  );
}

export default App;
