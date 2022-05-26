import { useEffect, useState } from 'react';
import '../../css/App.css';

function App() {
  const [transacts, setTransact] = useState(false);
  const [users, setUsers] = useState(false);
  useEffect(() => {
    getUsers();
  }, []);

  function getUsers() {
    fetch('http://localhost:3001')
    .then(response => {return response.text();})
    .then(data => {setUsers(data);});
  }

  return (
    <div className="App">
      {users ? users : 'No users available'}
      <header className="App-header">
      <h1 className='underline'>Hello123</h1>
      </header>
      
    </div>
  );
}

export default App;
