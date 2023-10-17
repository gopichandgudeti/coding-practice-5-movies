const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      fileName: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const getRequiredMovieDetails = (eachMovie) => {
  return {
    movieName: eachMovie.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
        * 
    FROM 
        movie;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => getRequiredMovieDetails(eachMovie))
  );
});

const convertDBObjectToResponseObject = (moviesArray) => {
  return {
    movieId: moviesArray.movie_id,
    directorId: moviesArray.director_id,
    movieName: moviesArray.movie_name,
    leadACtor: moviesArray.lead_actor,
  };
};

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = require.params;
  const getMoviesQuery = `
    SELECT 
        * 
    FROM 
        movie
    WHERE 
        movie_id = ${movieID};`;
  const moviesArray = await database.get(getMoviesQuery);
  response.send(getRequiredMovieDetails(moviesArray));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO
        movie (director_id, movie_name, lead_actor)
    VALUE 
        ('${directorId}', '${movieName}', '${leadActor}');`;
  const moviesArray = await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieID } = require.params;
  const updateMovieQuery = `
    UPDATE
        movie
    SET 
        director_id = '${directorId}',
        movie_name = '${movieName}'
        lead_actor = '${leadActor}',
    WHERE 
        movie_id = ${movieID};`;
  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movie/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
        movie 
    WHERE 
        movie_id = ${movieID};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const getDirectorAndMovieNames = (eachObject) => {
  return {
    directorId: eachObject.director_id,
    directorName: eachObject.director_name,
  };
};

app.get("/directors", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
        * 
    FROM 
        director;`;
  const directorArray = await database.get(getDirectorsQuery);
  response.send(
    directorArray.map((eachObject) => getDirectorAndMovieNames(eachObject))
  );
});

const getDirectorsById = (directorArray) => {
  return {
    movieName: directorArray.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsQuery = `
    SELECT 
        *
    FROM 
        director
    WHERE 
        director_id = ${directorId};`;
  const directorArray = await database.get(getDirectorsQuery);
  response.send(getDirectorsById(directorArray));
});

module.exports = app;
