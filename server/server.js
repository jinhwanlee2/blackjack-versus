const express = require('express')
const app = express()
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ port: 8080 }); 

const playerConnections = new Map();

var deck;
var hidden;


let playerData = [
    {
        playerId: 'dealer',
        hand: [],
        sum: 0,
        aceCount: 0
    }
];

// Function to broadcast data to all connected clients
function broadcastData(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', (ws) => {

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'startOtherClients') {
            const startGameMessage = {
                type: 'startGameMessage',
                gameStarted: true,
            };
            broadcastData(startGameMessage);
          
        }

        if (data.type === 'register') {
            playerConnections.set(data.playerId, ws);
        }
        

      /*
      // The server receives a message from the client
      // You can parse the message to get the playerId or any other data needed
      const data = JSON.parse(message);
      const playerId = data.playerId;
  
      // Find the specific player data based on the playerId
      const player = playerData.find((player) => player.playerId === playerId);
  
      // Send the player data to the specific client (using ws.send)
      if (player) {
        ws.send(JSON.stringify({ playerData: player }));
      } */

    };

    const broadcastPlayersData = () => {
        const dataToSend = {
          type: 'playerDataUpdate',
          playerData: playerData,
        };
    
        // Convert data to JSON and send it to all connected clients
        const jsonData = JSON.stringify(dataToSend);
        ws.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(jsonData);
          }
        });
      };
    ws.on('close', () => {
        console.log('Client disconnected');
        // process.exit(0);
    });
  });


    app.get('/api', (req, res) => {
        const { playerId } = req.query;
        const player = playerData.find(player => player.playerId === playerId);
        res.json(playerData);
    })
    app.post('/api', (req, res) => {
        const { playerId } = req.body;
        const player = playerData.find(player => player.playerId === playerId);
      
        if (player) {
            // If playerId is found, update the player data
            res.json([player]);
        } else {
            // If playerId is not found, create a new entry
            const newPlayer = {
                playerId,
                hand: [],
                sum: 0,
                aceCount: 0
            };
            playerData.push(newPlayer);
            res.json([newPlayer]);
        }
    });
    app.post('/api/build-deck', (req, res) => {
        let value = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        let suit = ["H", "C", "D", "S"];
        deck = [];

        for (let i = 0; i < suit.length; i++) {
            for (let j = 0; j < value.length; j++) {
                deck.push(value[j] + "-" + suit[i]);
            }
        }
        
        // Send a success response to the client
        res.sendStatus(200);
    });
    app.post('/api/shuffle-deck', (req, res) => {
        for (let i = 0; i < deck.length; i++) {
            let j = Math.floor(Math.random() * deck.length);
            let temp = deck[i];
            deck[i] = deck[j];
            deck[j] = temp;
        }
        let sendData = {
            playerData: playerData
        };
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(sendData));
            }
        });
      
        // Send a success response to the client (status code 200)
        res.sendStatus(200);
    });
    app.post('/api/start-game', (req, res) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                const gameState = {
                    type: 'startGameMessage',
                };
                client.send(JSON.stringify(gameState));
            }
        });
        delay(2000);

        hidden = deck.pop();
        const dealer = playerData.find(player => player.playerId === 'dealer');
        var player;
        dealer.sum += getValue(hidden);
        dealer.aceCount += checkAce(hidden);

        var otherCard;
        var playerConnection;
        let card = deck.pop();
        let cardData = {
            type: 'dealerStart',
            src: card,
            value: getValue(card),
        };
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(cardData));
            }
        });

        

        dealer.sum += getValue(card);
        dealer.aceCount += checkAce(card);

        for (let j = 1; j < playerData.length; j++){
            for (let i = 0; i < 2; i++) {
                player = playerData[j];
                playerConnection = playerConnections.get(player.playerId);
                card = deck.pop();
                player.sum += getValue(card);
                player.aceCount += checkAce(card);

                if (player.sum > 21) {
                    reduceAce(player.sum, player.aceCount);
                }
                cardData = {
                    type: 'clientStart',
                    src: card,
                    sum: player.sum,
                    playerId: player.playerId
                };
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(cardData));
                    }
                });
                

                /*     Tried to implement method to see other player hand, but maybe should use express js here
                for (let k = 1; k < playerData.length && k != j; k++) {
                    otherCard = {
                        type: 'otherCards',
                        src: card,
                    }
                    player = playerData[k];
                    playerConnection = playerConnections.get(player.playerId);
                    playerConnection.send(JSON.stringify(otherCard));
                }
                */
                
            }
        } 
        // Send a success response to the client (status code 200)
        res.sendStatus(200);

        // document.getElementById("hit").addEventListener("click", hit);
        // document.getElementById("stand").addEventListener("click", stand);

    });


app.listen(5000, () => {console.log("Server started on port 5000") })


function getValue(card) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];
  
    if (isNaN(value)) { //A J Q K
        if (value === "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
 }

function checkAce(card) {
    if (card[0] === "A") {
        return 1;
    }
    return 0;
}

function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


