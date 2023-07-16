import back from './cards/BACK.png'
import axios from 'axios';
import './blackjack.css';
import React, { useEffect, useState } from 'react';

import { cardToSrc } from './blackjackUtil';



function App() {

  const [backendData, setBackendData] = useState([{}])
  const [playerId, setPlayerId] = useState('');
  const [confirmedPlayerId, setConfirmedPlayerId] = useState('');
  const [isPlayerConfirmed, setPlayerConfirmed] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');

  const handleConfirm = async () => {
    setConfirmedPlayerId(playerId);
    setPlayerConfirmed(true);
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const startButton = async () => {

    setGameStarted(true);
    
    await axios.post('/api/build-deck')
      .then((response) => {
        console.log('Build deck successful:', response.data);
      })
      .catch((error) => {
        console.error('Error building deck:', error);
      });
    delay(700);
    await axios.post('/api/shuffle-deck')
      .then((response) => {
        console.log('Shuffle deck successful:', response.data);
      })
      .catch((error) => {
        console.error('Error shuffling deck:', error);
      });
    delay(700);
      await axios.post('/api/start-game')
      .then((response) => {
        console.log('Start game successful:', response.data);
      })
      .catch((error) => {
        console.error('Error starting game:', error);
      });
    
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

 

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080'); 

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message from server:', data);

      // Handle incoming messages from the server as needed
      if (data.type === 'dealerStart') {
        const cardImg = document.createElement("img");
        cardImg.src = cardToSrc(data.src);
        cardImg.classList.add("slide-in");
        document.getElementById("dealer-cards").append(cardImg);
        document.getElementById("dealer-sum").innerText = data.value;
      }
      if (data.type === 'clientStart') {
        const cardImg = document.createElement("img");
        cardImg.src = cardToSrc(data.src);
        cardImg.classList.add("slide-in");
        document.getElementById("your-cards").append(cardImg);
        document.getElementById("your-sum").innerText = data.sum;
      }
      if (data.type === 'signal') {
        document.getElementById("your-sum").innerText = data.sum;
      }
      if (data.type === 'startGameMessage') {
        setGameStarted(true);
      }
      
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setSocket(null);
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Function to send a message to the server
  const sendMessage = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: message }));
      setMessage('');
    }
  };

  return (
    <div className="game">
      {/* Input field for entering playerId */}
      <input
        type="text"
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
        placeholder="Enter your Player Id"
      />
      <button onClick={handleConfirm}>
        Confirm PlayerId
      </button>
      <button onClick={startButton}>
        Start Game
      </button>

      <div>
          {isPlayerConfirmed ? (
            backendData.map(player => (
              <div key={player.playerId}>
                <p>Player ID: {player.playerId}</p>
              </div>
            ))
          ) : (
            <p>Please confirm your Player Id</p>
          )}
          </div>
      
      {isGameStarted ? (
        <>
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
          <p>Waiting for game start...</p>
        </>
      )}
    </div>
  );
}

export default App;
