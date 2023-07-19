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
var end = false;
var stand = false;
var playersLeft = 0;
var actions = 0;
var deck;
var hidden;


let playerData = [
    {
        playerId: 'dealer',
        check: false,
        sum: 0,
        aceCount: 0
    }
];

// Function to broadcast data to all connected clients
function broadcastData(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            const newData = { ...data, playerData: playerData };
            client.send(JSON.stringify(newData));
        }
    });
}

wss.on('connection', (ws) => {
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'restart') {
            var player;
            let dealer = playerData[0];
            dealer.check = false;
            dealer.sum = 0;
            dealer.aceCount = 0;
            for (let j = 1; j < playerData.length; j++) {
                player = playerData[j];
                player.check = false;
                player.action = '';
                player.sum = 0;
                player.aceCount = 0;
                player.busted = false;
            }
            const restartGame = {
                type: 'restartGame'
            }
            end = false;
            stand = false;
            playersLeft = 0;
            actions = 0;

            console.log('restart game');
            broadcastData(restartGame);
            const playerConnection = playerConnections.get(data.playerId);
            const startGame = {
                type: 'startGame'
            }
            playerConnection.send(JSON.stringify(startGame));

        }
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
        if (data.type === 'endGame') {
            let draw = 0;
            console.log(playersLeft);
            console.log(end);
            if (playersLeft === 0 && end === false){
                end = true;
                const dealer = playerData.find(player => player.playerId === 'dealer');
                while (dealer.sum > 21 && dealer.aceCount > 0) {
                    dealer.sum -= 10;
                    dealer.aceCount -= 1;
                }
                let cardData = {
                    type: 'dealerEnd',
                    src: hidden,
                    sum: dealer.sum
                };
                broadcastData(cardData);
                while (dealer.sum < 17) {
                    let card = deck.pop();
                    dealer.sum += getValue(card);
                    dealer.aceCount += checkAce(card);
                    if (dealer.sum > 21 && dealer.aceCount > 0) {
                        dealer.sum -= 10;
                        dealer.aceCount -= 1;
                    }
                    let endDraw = {
                        type: 'endDraw',
                        src: card,
                        sum: dealer.sum,
                        draw: draw
                    }
                    broadcastData(endDraw);
                    draw++;
                }
                const final = {
                    type: 'final',
                    sum: dealer.sum
                }
                broadcastData(final);
                
            }
        }
        if (data.action === 'stand') {
            const player = playerData.find(player => player.playerId === data.playerId);
            const playerConnection = playerConnections.get(data.playerId);
            playersLeft -= 1;
            if (playersLeft < 0) {
                playersLeft = 0;
            }
            stand = true;
            player.busted = true;
            const Data = {
                type: 'standResponse',
                busted: stand,
                playerData: playerData
            };
            playerConnection.send(JSON.stringify(Data));
        }
        if (data.action === 'hit') {
            let card = deck.pop();
            const player = playerData.find(player => player.playerId === data.playerId);
            player.sum += getValue(card);
            player.aceCount += checkAce(card);
                
            if (player.sum > 21 && player.aceCount > 0){
                while (player.sum > 21 && player.aceCount > 0) {
                    player.sum -= 10;
                    player.aceCount -= 1;
                }
            }
            if (player.sum > 21) { 
                playersLeft -= 1;
                if (playersLeft < 0) {
                    playersLeft = 0;
                }
                stand = true;
                player.busted = true;
            }
            else {
                stand = false;
            }
            const cardData = {
                type: 'hitResponse',
                src: card,
                sum: player.sum,
                playerId: player.playerId,
                busted: stand,
                playerData: playerData
            };
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(cardData));
                }
            });
            busted = false; 
        }
        if (data.action === 'wantHit') {
            const player = playerData.find(player => player.playerId === data.playerId);
            let playerConnectionH = playerConnections.get(player.playerId);
            if (player.check === false){
                player.action = 'hit';
                actions += 1;
                player.check = true;
            }
      
            const turnStart = {
                type: 'turnStart',
                value: true,
                playerData: playerData
            }
            
            if (actions === playersLeft) {
         
                var players;
                for (let j = 1; j < playerData.length; j++){
                    players = playerData[j];
                    players.check = false;
                }
                broadcastData(turnStart);
                players.action = '';
                actions = 0;
                const doneWaiting = {
                    type: 'doneWaiting'
                }
                broadcastData(doneWaiting);
            }

            else {
                const waiting = {
                    type: 'waiting'
                }
                playerConnectionH.send(JSON.stringify(waiting));
            }
        }
        if (data.action === 'wantStand') {
            var player = playerData.find(player => player.playerId === data.playerId);
            let playerConnectionS = playerConnections.get(player.playerId);
            if (player.check === false){
                player.action = 'stand';
                actions += 1;
                player.check = true;
                player.busted = true;
            }
            const turnStart = {
                type: 'turnStart',
                value: true,
                playerData: playerData
            }
            
            if (actions === playersLeft) {
                for (let j = 1; j < playerData.length; j++){
                    player = playerData[j];
                    player.check = false;
                }
                broadcastData(turnStart);
                player.action = '';
                actions = 0;
                const doneWaiting = {
                    type: 'doneWaiting'
                }
                broadcastData(doneWaiting);
            }
            else {
                const waiting = {
                    type: 'waiting'
                }
                playerConnectionS.send(JSON.stringify(waiting));
            }
        }
    };

    ws.on('close', () => {
        console.log('Client disconnected');
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
                check: false,
                action: '',
                sum: 0,
                aceCount: 0,
                busted: false
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
        playersLeft = playerData.length - 1;
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
        hidden = deck.pop();
        const dealer = playerData.find(player => player.playerId === 'dealer');
        var player;
        dealer.sum += getValue(hidden);
        dealer.aceCount += checkAce(hidden);

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
        var draw;
        for (let j = 1; j < playerData.length; j++){
            draw = 0;
            for (let i = 0; i < 2; i++) {
                player = playerData[j];
                playerConnection = playerConnections.get(player.playerId);
                card = deck.pop();
                player.sum += getValue(card);
                player.aceCount += checkAce(card);

                if (player.sum > 21) {
                    while (player.sum > 21 && player.aceCount > 0) {
                        player.sum -= 10;
                        player.aceCount -= 1;
                    }
                }
                cardData = {
                    type: 'clientStart',
                    src: card,
                    sum: player.sum,
                    playerId: player.playerId,
                    draw: draw
                };
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(cardData));
                    }
                });
                draw++;     
            }
        } 
        res.sendStatus(200);
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

