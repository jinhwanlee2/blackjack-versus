

const express = require('express')
const app = express()
const cors = require('cors');
app.use(express.json());
app.use(cors());

let gameState = null;

let playerData = [
    /*
    {
      playerId: 'player1', // Unique playerId for the first player
      name: 'Player 1', // Default name for the first player
      balance: 100000, // Default balance for the first player
      hand: [],
      sum: 0
    },
    {
      playerId: 'player2', // Unique playerId for the second player
      name: 'Player 2', // Default name for the second player
      balance: 100000, // Default balance for the second player
      hand: [],
      sum: 0
    },
    */
    {
      playerId: 'dealer',
      name: 'dealer',
      balance: 9999999,
      hand: [],
      sum: 0
    }
  ];


app.route('/api')
    .get((req, res) => {
        const { playerId } = req.query;
        const player = playerData.find(player => player.playerId === playerId);
        res.json(playerData);
    })

    /*
    if (!player) {
        // If playerId is not found, create a new entry
        const newPlayer = {
          playerId,
          name: 'New PlayerGETREQUEST', // Default name for new players
          balance: 1110, // Default balance for new players
        };
        playerData.push(newPlayer);
        res.json([newPlayer]);
      } else {
        res.json([player]);
      }

    const Player1 = {
        playerId,
        name: 'NEW PLAYER2', // Default name for new players
        balance: 100000, // Default balance for new players
      };
      playerData.push(Player1);
      
    
      const Player2 = {
        playerId,
        name: 'NEW PLAYER', // Default name for new players
        balance: 100000, // Default balance for new players
      };
      playerData.push(Player2);
      */

      
   

      app.post('/api', (req, res) => {
        const { playerId, name, balance } = req.body;
        const player = playerData.find(player => player.playerId === playerId);
      
        if (player) {
          // If playerId is found, update the player data
          player.name = name || player.name; // Update name if provided in the request body
          player.balance = balance || player.balance; // Update balance if provided in the request body
          res.json([player]);
        } else {
          // If playerId is not found, create a new entry
          const newPlayer = {
            playerId,
            name: name || 'New PlayeXr', // Default name for new players if not provided in the request body
            balance: balance || 0, // Default balance for new players if not provided in the request body
          };
          playerData.push(newPlayer);
          res.json([newPlayer]);
        }
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