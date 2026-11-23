import db from "#db/client";

/** Adds a user's thumbs up or down to a movie and returns it. */
export async function createVote(userId, movieId, thumbsUp) {
  const sql = `
  INSERT INTO votes
    (user_id, movie_id, thumbs_up)
  VALUES
    ($1, $2, $3)
  RETURNING *
  `;
  const {
    rows: [vote],
  } = await db.query(sql, [userId, movieId, thumbsUp]);
  return vote;
}

/** Gets every vote on a movie. */
export async function getVotesByMovieId(movieId) {
  const sql = `
  SELECT *
  FROM votes
  WHERE movie_id = $1
  `;
  const { rows: votes } = await db.query(sql, [movieId]);
  return votes;
}

/** Gets a user's vote on a movie, if they've voted. */
export async function getVoteByUserAndMovie(userId, movieId) {
  const sql = `
  SELECT *
  FROM votes
  WHERE user_id = $1 AND movie_id = $2
  `;
  const {
    rows: [vote],
  } = await db.query(sql, [userId, movieId]);
  return vote;
}

/** Changes a vote to a thumbs up or down and returns it. */
export async function updateVoteById(id, thumbsUp) {
  const sql = `
  UPDATE votes
  SET thumbs_up = $2
  WHERE id = $1
  RETURNING *
  `;
  const {
    rows: [vote],
  } = await db.query(sql, [id, thumbsUp]);
  return vote;
}
