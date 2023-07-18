import back from './cards/BACK.png'
import axios from 'axios';
import './blackjack.css';
import React, { useEffect, useState, useRef } from 'react';

import { cardToSrc } from './blackjackUtil';

var busted = false;

function App() {
  const [backendData, setBackendData] = useState([{}])
  const [playerId, setPlayerId] = useState('');
  const [confirmedPlayerId, setConfirmedPlayerId] = useState('');
  const [isPlayerConfirmed, setPlayerConfirmed] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [playersData, setPlayersData] = useState([]);
  
  const socketRef = useRef(null);
  const handleHit = () => {
    if (!busted && confirmedPlayerId && socketRef.current) {
      // Send the message to the server using WebSocket
      const message = {
        type: 'action', 
        action: 'hit',
        playerId: confirmedPlayerId,
        busted: busted
      };
      socketRef.current.send(JSON.stringify(message));
    }
  };
  const handleStand = () => {
    if (!busted && confirmedPlayerId && socketRef.current) {
      // Send the message to the server using WebSocket
      const message = {
        type: 'action', 
        action: 'stand',
        playerId: confirmedPlayerId,
        busted: busted
      };
      socketRef.current.send(JSON.stringify(message));
    }
  };


  const wantHit = () => {
    const message = {
      action: 'wantHit',
      playerId: confirmedPlayerId
    }
    socketRef.current.send(JSON.stringify(message));
  }

  const wantStand = () => {
    const message = {
      action: 'wantStand',
      playerId: confirmedPlayerId
    }
    socketRef.current.send(JSON.stringify(message));
  }



  
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

        /*
        Commented out since handled by css (?)
      const hitButton = document.getElementById("hit");
      if (hitButton) {
        hitButton.addEventListener("click", handleHit);
      }
      */ 

      socketRef.current = ws;

      const message ={
        type: 'register',
        playerId: confirmedPlayerId,
      };
      ws.send(JSON.stringify(message));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message from server:', data);
      var cardImg;

      // Handle incoming messages from the server as needed
      if (data.playerData) {
        setPlayersData(data.playerData);
      }
      if (data.type === 'dealerStart') {
        const cardImg = document.createElement("img");
        cardImg.src = cardToSrc(data.src);
        cardImg.classList.add("slide-in");
        document.getElementById("dealer-cards").append(cardImg);
        document.getElementById("dealer-sum").innerText = data.value;
      }
      if (data.type === 'clientStart') {
        cardImg = document.createElement("img");
        cardImg.src = cardToSrc(data.src);
        cardImg.classList.add("slide-in");
     
          setTimeout(() => {
            document.getElementById(`player-${data.playerId}-cards`).append(cardImg);
            if (data.playerId === confirmedPlayerId){
              document.getElementById(`player-${data.playerId}-sum`).innerText = data.sum;
            }
          }, 500);
      }
      if (data.type === 'startGameMessage') {
        setGameStarted(true);
      }
      if (data.type === 'hitResponse') {
        busted = data.busted;
        cardImg = document.createElement("img");
        cardImg.src = cardToSrc(data.src);
        cardImg.classList.add("slide-in");
        setTimeout(() => {
          document.getElementById(`player-${data.playerId}-cards`).append(cardImg);
          if (data.playerId === confirmedPlayerId){
            document.getElementById(`player-${data.playerId}-sum`).innerText = data.sum;
          }
        }, 500);
      }
      if (data.type === 'turnStart') {
        handleHit();
      }
      if (data.type === 'turnStand') {
        handleStand();
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
  }, [confirmedPlayerId]);

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

       
          {playersData.slice(1).map((player) => (
            <div key={player.playerId}>
              <h2>
                {player.playerId === confirmedPlayerId ? 'You: ' : `${player.playerId}:`}
                <span id={`player-${player.playerId}-sum`}></span>
              </h2>
              <div
                id={`player-${player.playerId}-cards`}
                className={`cards-container ${player.playerId === confirmedPlayerId ? 'your-cards' : 'other-cards'}`}
              ></div>
            </div>
          ))}

          <br />
          <button id="hit" onClick={() => wantHit()}>
            Hit
          </button>
          <button id="stand" onClick={() => wantStand()}>
            Stand
          </button>
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
