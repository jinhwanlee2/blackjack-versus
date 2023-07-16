import back from './cards/BACK.png'
import axios from 'axios';
import './blackjack.css';
import React, { useEffect, useState } from 'react';

import { buildDeck, shuffleDeck, startGame} from './blackjackUtil';


function App() {

  

  const [backendData, setBackendData] = useState([{}])
  const [playerId, setPlayerId] = useState('');
  const [confirmedPlayerId, setConfirmedPlayerId] = useState('');
  const [isPlayerConfirmed, setPlayerConfirmed] = useState(false);


  /*
  useEffect(() => {
    
      // Fetch player data from the server when playerId is confirmed
      axios.post('/api', { playerId: confirmedPlayerId })
  .then(response => {
    setBackendData(response.data); // Use response.data directly
  })
  .catch(error => {
    console.error('Error fetching player data:', error);
  });
    
  }, [isPlayerConfirmed, confirmedPlayerId]);

  */

  const handleConfirm = async () => {
    setConfirmedPlayerId(playerId);
    setPlayerConfirmed(true);
  };

  useEffect(() => {
    if (isPlayerConfirmed) {
      axios.post('/api', { playerId: confirmedPlayerId })
        .then(response => {
          setBackendData(response.data);
        })
        .catch(error => {
          console.error('Error fetching player data:', error);
        });
    }
  }, [isPlayerConfirmed, confirmedPlayerId]);

  const isGameReady = confirmedPlayerId !== '' && isPlayerConfirmed;

  useEffect(() => {
    if (isGameReady) {
      buildDeck();
      shuffleDeck();
      startGame();
    }
  }, [isGameReady]);

  

  return (
    <div className="game">
      {/* Input field for entering playerId */}
      <input
        type="text"
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
        placeholder="Enter your playerId"
      />
      {/* Button to confirm playerId */}
      <button onClick={handleConfirm}>
        Confirm PlayerId
      </button>

      {isGameReady ? (
        <>
          {/* Rest of your game elements */}
          <div>
          {isPlayerConfirmed ? (
            backendData.map(player => (
              <div key={player.playerId}>
                <p>Player ID: {player.playerId}</p>
                <p>Name: {player.name}</p>
                <p>Balance: {player.balance}</p>
              </div>
            ))
          ) : (
            <p>Please confirm your playerId</p>
          )}
          </div>
          <h2>Dealer: <span id="dealer-sum"></span></h2>
          <div id="dealer-cards">
            <img id="hidden" src={back} alt="backside" />
          </div>

          <h2>You: <span id="your-sum"></span></h2>
          <div id="your-cards"></div>

          <br />
          <button id="hit">Hit</button>
          <button id="stand">Stand</button>
          <p id="results"></p>
        </>
      ) : (
        <>
          {/* Render a loading or placeholder message */}
          <p>Loading...</p>
        </>
      )}
    </div>
  );
}

export default App;
