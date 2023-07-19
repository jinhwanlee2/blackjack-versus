import back from './cards/BACK.png'
import axios from 'axios';
import './blackjack.css';
import React, { useEffect, useState, useRef } from 'react';

import { cardToSrc } from './blackjackUtil';

var busted = false;
var end = false;

function App() {
  const [backendData, setBackendData] = useState([{}])
  const [playerId, setPlayerId] = useState('');
  const [confirmedPlayerId, setConfirmedPlayerId] = useState('');
  const [isPlayerConfirmed, setPlayerConfirmed] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [playersData, setPlayersData] = useState([]);
  const [isWaiting, setWaiting] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [isGameEnded, setGameEnded] = useState(false);
  
  const socketRef = useRef(null);
  const handleHit = () => {
    console.log(busted);
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
    if (confirmedPlayerId && socketRef.current) {
      // Send the message to the server using WebSocket
      const message = {
        type: 'action', 
        action: 'stand',
        playerId: confirmedPlayerId,
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
    if (!busted){
      const message = {
        action: 'wantStand',
        playerId: confirmedPlayerId
      }
      socketRef.current.send(JSON.stringify(message));
      busted = true;
    }

  }

  const handleConfirm = async () => {
    setConfirmedPlayerId(playerId);
    setPlayerConfirmed(true);
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const restartGame = () => {
    setGameStarted(false);
    setGameEnded(false);

    // Reset the cards in players' hands
    document.querySelectorAll('.cards-container').forEach((container) => {
      container.innerHTML = '';
    });

    // Reset dealer's hand
    const dealerCardsContainer = document.getElementById('dealer-cards');
    dealerCardsContainer.innerHTML = '';

    // Create the hidden card
    const hiddenCardImg = document.createElement('img');
    hiddenCardImg.id = 'hidden';
    hiddenCardImg.alt = 'backside';
    hiddenCardImg.src = back;
    dealerCardsContainer.appendChild(hiddenCardImg);

    // Call the startGame function to begin a new game
    busted = false;
    end = false;    
    document.getElementById("results").innerText = '';
    setShowButtons(true);
  };

  const restart = async () => {
    const restart = {
      type: 'restart', 
      playerId: confirmedPlayerId
    };
    socketRef.current.send(JSON.stringify(restart));
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
      if (data.type === 'restartGame') {
        restartGame();
      }
      if (data.type === 'waiting') {
        setWaiting(true);
      }
      if (data.type === 'doneWaiting') {
        setWaiting(false);
      }
      if (data.type === 'dealerStart') {
        const cardImg = document.createElement("img");
        cardImg.src = cardToSrc(data.src);
        cardImg.classList.add("slide-in");
        document.getElementById("dealer-cards").append(cardImg);
        document.getElementById("dealer-sum").innerText = data.value;
      }
      if (data.type === 'dealerEnd') {
        setTimeout(() => {
          const cardImg = document.createElement("img");
          cardImg.classList.add("slide-in");
          document.getElementById("hidden").src = cardToSrc(data.src);
          document.getElementById("dealer-sum").innerText = data.sum;
        }, 500);
      }
      if (data.type === 'endDraw') {
        setTimeout(() => {
          const cardImg = document.createElement('img');
          cardImg.src = cardToSrc(data.src);
          cardImg.classList.add('slide-in');
          document.getElementById('dealer-cards').append(cardImg);
          document.getElementById('dealer-sum').innerText = data.sum;
        }, data.draw * 500 + 1000); 
      }
      if (data.type === 'final') {
        
        setTimeout(() => {
          if (!end) {
            const player = data.playerData.find((player) => player.playerId === confirmedPlayerId);
            let message = "";
            // Outcome logic
            if (data.sum > 21) {
              message = "You win";
            }
            else if (player.sum === data.sum) {
                message = "Tie";
            }
            else if (player.sum > data.sum) {
                message = "You Win";
            }
            else if (player.sum < data.sum) {
                message = "You Lose";
            }
            document.getElementById("results").innerText = message;
          }
      }, 1500); 
      setGameEnded(true);
      }
      if (data.type === 'clientStart') {
        setTimeout(() => {
          cardImg = document.createElement("img");
          cardImg.src = cardToSrc(data.src);
          cardImg.classList.add("slide-in");
          document.getElementById(`player-${data.playerId}-cards`).append(cardImg);
          document.getElementById(`player-${data.playerId}-sum`).innerText = data.sum;
        }, data.draw*500 + 500);
      }
      if (data.type === 'startGameMessage') {
        setGameStarted(true);
      }
      if (data.type === 'standResponse') {
        busted = true;
        setShowButtons(false);
        const checkEnd = {
          type: 'endGame'
        }
        socketRef.current.send(JSON.stringify(checkEnd));
      }
      if (data.type === 'hitResponse') {
        const player = data.playerData.find((player) => player.playerId === confirmedPlayerId);
        busted = player.busted;
        cardImg = document.createElement("img");
        cardImg.src = cardToSrc(data.src);
        cardImg.classList.add("slide-in");
        setTimeout(() => {
          document.getElementById(`player-${data.playerId}-cards`).append(cardImg);
          document.getElementById(`player-${data.playerId}-sum`).innerText = data.sum;
        }, 500);
        if (data.playerId === confirmedPlayerId && busted === true) {
          end = true;
          document.getElementById("results").innerText = 'BUSTED';
        }
        if (data.busted === true) {
          setShowButtons(false);
          const checkEnd = {
            type: 'endGame'
          }
          socketRef.current.send(JSON.stringify(checkEnd));
        }
      }
      if (data.type === 'turnStart') {
        const player = data.playerData.find((player) => player.playerId === confirmedPlayerId);
          if (player.action === 'hit'){
            handleHit();
          }
          if (player.action === 'stand') {
            handleStand();
          }
      }
      if (data.type === 'startGame') {
        startButton();
      }
   
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
   
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [confirmedPlayerId]);

  return (
    <div className="game">
      {!isGameStarted && (
        <>
          <input
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Enter your Player Id"
            className = "confirm"
          />
          <button onClick={handleConfirm}>Confirm Player Id</button>
          <button onClick={startButton}>Start Game</button>

          <div>
            {isPlayerConfirmed ? (
              backendData.map((player) => (
                <div key={player.playerId}>
                  <p>Player ID: {player.playerId}</p>
                </div>
              ))
            ) : (
              <p>Please confirm your Player Id</p>
            )}
          </div>
        </>
      )}
      
      
      {isGameStarted ? (
        <>
          <h2>Dealer: <span id="dealer-sum"></span></h2>
          <div id="dealer-cards">
            <img id="hidden" src={back} alt="backside" />
          </div>

          <div className="player-container">
            {playersData.slice(1).map((player) => (
              <div key={player.playerId} className="player">
                <div>
                  <h2>
                    {player.playerId === confirmedPlayerId ? 'You: ' : `${player.playerId}: `}
                    <span id={`player-${player.playerId}-sum`}></span>
                  </h2>
                  <div
                    id={`player-${player.playerId}-cards`}
                    className={`cards-container ${player.playerId === confirmedPlayerId ? 'your-cards' : 'other-cards'}`}
                  ></div>
                </div>
                <div className="action-buttons">
                  {player.playerId === confirmedPlayerId && showButtons && (
                    <>
                      <button id="hit" onClick={() => wantHit()}>
                        Hit
                      </button>
                      <button id="stand" onClick={() => wantStand()}>
                        Stand
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <br />
    
          <p id="results"></p>
          {isWaiting && <p>Waiting for other players' response...</p>}
        </>
      ) : (
        <>
          <p>Waiting for game start...</p>
        </>
      )}
    {isGameEnded && (
      <button onClick={restart}>Restart Game</button>
    )}
    </div>
  );
}

export default App;
