const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
    try {
        database = await open ({
            fileName : databasePath,
            driver : sqlite3.Database,
        });
    } 
    app.listen(3000, () =>
       console.log("Server Running at http://localhost:3000/");
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertPlayerObjectToResponsiveObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
   
  };
};

const convertMatchObjectToResponsiveObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year : dbObject.year,
  };
};
app.get("/players/", async (request, response ) => {
    const getAllPlayer = `
    SELECT 
       *
    FROM 
      player_details;`;
    const playersArray = await database.all(getAllPlayer);
    response.send(playersArray.map((everyPlayer) => 
        convertMatchObjectToResponsiveObject(eachPlayer)
    ));
});
app.get("/players/:playerId/", async (request, response ) => {
    const {playerId} = request.params;
    const getPlayerQuery = `
    SELECT  
      *
    FROM 
       player_details
    WHERE 
       player_id = ${player_id};`;
    const player = await database.get(getPlayerQuery);
    response.send(convertPlayerObjectToResponsiveObject(player))
});
app.put("/players/:playerId/", async (request, response) => {
    const { playerId } = request.params;
    const { playerName} = request.body;
    const updatePlayerDetails = `
    UPDATE 
      player_details
    SET 
       player_name = '${playerName}'
    WHERE
      player_id = ${playerId};`;
    await database.run(updatePlayerDetails);
    response.send("Player Details Updated");
})
app.get("/matches/:matchId/", async (request, response) => {
    const { matchId } = request.params;
    const matchDetailsQuery =`
    SELECT 
      * 
    FROM 
       match_details
    WHERE 
        match_id = ${matchId};`;
    const matchDetails = await database.get(matchDetailsQuery);
    response.send(convertMatchObjectToResponsiveObject(matchDetails));
});
app.get("/players/:playerId/matches", async (request, response) => {
    const { playerId } = request.params;
    const getPlayerMatchDetails = `
    SELECT 
       *
    FROM 
       player_match_score
       NATURAL JOIN match_details
    WHERE 
      player_id = ${playerId};`;
    const playerMatch = await database.all(getPlayerMatchDetails);
    response.send(
     playerMatch.map((eachMatch) => 
     convertMatchObjectToResponsiveObject(eachMatch))
    );
});
app.get("/matches/:matchId/players", async(request, response) => {
    const {matchId} = request.params;
    const getPlayersQuery = `
    SELECT 
      *
    FROM 
       player_match_score NATURAL JOIN player_details
    WHERE 
      match_id = ${matchId};`;
    const playerArray = await database.all(getPlayersQuery);
    response.send(playerArray.map((eachPlayer) => 
    convertPlayerObjectToResponsiveObject(eachPlayer));
});
app.get("/players/:playerId/playerScores", async (request, response) => {
    const { playerId } = request.params;
    const getMatchPlayerQuery = `
    SELECT 
    player_id As player_id,
    player_name As playerName,
    SUM(score) As totalScore,
    SUM(fours) As totalFours,
    SUM(sixes) As totalSixes,
    FROM player_match_score
    NATURAL JOIN player_details
    WHERE 
      player_id = ${playerId};`;
    const playersMatchDetails = await database.get(getMatchPlayerQuery)
    response.send(playersMatchDetails);
});
module.exports = app ;