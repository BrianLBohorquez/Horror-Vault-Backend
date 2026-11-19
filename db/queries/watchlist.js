import db from "#db/client";

/** Adds a movie to a user's watchlist and returns the new item. */
export async function createWatchlistItem(userId, movieId) {
  const sql = `
  INSERT INTO watchlist
    (user_id, movie_id)
  VALUES
    ($1, $2)
  RETURNING *
  `;
  const {
    rows: [item],
  } = await db.query(sql, [userId, movieId]);
  return item;
}

/** Gets a user's watchlist with each movie's title, year and poster, unwatched and newest first. */
export async function getWatchlistByUserId(userId) {
  const sql = `
  SELECT watchlist.*, movies.title, movies.year, movies.poster_url
  FROM
    watchlist
    JOIN movies ON movies.id = watchlist.movie_id
  WHERE watchlist.user_id = $1
  ORDER BY watchlist.watched, watchlist.id DESC
  `;
  const { rows: watchlist } = await db.query(sql, [userId]);
  return watchlist;
}

/** Gets one watchlist item by its ID. */
export async function getWatchlistItemById(id) {
  const sql = `
  SELECT *
  FROM watchlist
  WHERE id = $1
  `;
  const {
    rows: [item],
  } = await db.query(sql, [id]);
  return item;
}

/** Marks a watchlist item as watched or unwatched and returns it. */
export async function updateWatchlistItemById(id, watched) {
  const sql = `
  UPDATE watchlist
  SET watched = $2
  WHERE id = $1
  RETURNING *
  `;
  const {
    rows: [item],
  } = await db.query(sql, [id, watched]);
  return item;
}

/** Deletes a watchlist item. */
export async function deleteWatchlistItemById(id) {
  const sql = `
  DELETE FROM watchlist
  WHERE id = $1
  `;
  await db.query(sql, [id]);
}
