

const express = require('express')
const app = express()
const cors = require('cors');
app.use(cors());

let gameState = null;

const playerData = {};


app.get('/api', (req, res) => {
  const { playerId } = req.query;

  // If playerId is not in the playerData object, create a new entry
  if (!playerData[playerId]) {
    playerData[playerId] = {
      name: 'New Player', // Default name for new players
      balance: 0, // Default balance for new players
    };
  }

  // Respond with the player info
  res.json(playerData[playerId]);
});

// POST request to update player data
app.post('/api', (req, res) => {
    const { playerId } = req.body; // Assuming the request contains playerId in the request body
  
    // If playerId is not in the playerData object, create a new entry
    if (!playerData[playerId]) {
      playerData[playerId] = {
        name: 'New Player', // Default name for new players
        balance: 0, // Default balance for new players
      };
    }
  
    // Respond with the updated player info
    res.json(playerData[playerId]);
  });


/*app.post('/api', (req, res) => {
    const { playerId } = req.body;
  
    // If playerId is not in the playerData object, create a new entry
    if (!playerData[playerId]) {
      playerData[playerId] = {
        name: 'New Player', // Default name for new players
        balance: 0, // Default balance for new players
      };
    }
  
    // Respond with the player info
    res.json(playerData[playerId]);
  });
*/

/*app.get("/api", (req, res) => {
    const { playerId } = req.query;
    const playerInfo = playerData[playerId] || { name: 'New Player'};
    res.json({"users": ["userOne", "userTwo", "userThree", playerInfo] })
})
*/

app.listen(5000, () => {console.log("Server started on port 5000") })


/*
function initializeGame() {
    gameState = {
        players: {
            player1: {
                hand: [],
                score: 0,
            },
            player2: {
                hand: [],
                score: 0,
            },
        },
        deck: [],
        dealer: {
            hand: [],
            score: 0,
        }
    };
}

function joinGame(playerId) {
    if (!this.state.playerOne) {
      this.state[playerId] = "playerOne";
    } else if (!this.state.playerTwo) {
      this.state[playerId] = "playerTwo";
    }
}
*/