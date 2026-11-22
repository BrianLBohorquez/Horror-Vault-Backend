import db from "#db/client";

/** Adds a movie to the database and returns it. */
export async function createMovie(
  title,
  year,
  posterUrl,
  synopsis,
  subgenreId,
  subgenre2Id,
  subgenre3Id,
  rating,
  review,
  liked,
  dateLogged,
  letterboxdUrl,
) {
  const sql = `
  INSERT INTO movies
    (title, year, poster_url, synopsis, subgenre_id, subgenre_2_id, subgenre_3_id, rating, review, liked, date_logged, letterboxd_url)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  RETURNING *
  `;
  const {
    rows: [movie],
  } = await db.query(sql, [
    title,
    year,
    posterUrl,
    synopsis,
    subgenreId,
    subgenre2Id,
    subgenre3Id,
    rating,
    review,
    liked,
    dateLogged,
    letterboxdUrl,
  ]);
  return movie;
}

/**
 * Gets the movies that match the search and tags, sorted by the given column and order.
 * Leaves out the user's watched movies when a user ID is given.
 */
export async function getMovies(
  search,
  showTags,
  hideTags,
  sort,
  order,
  userId,
) {
  const columns = {
    title: "movies.title",
    year: "movies.year",
    logged: "movies.date_logged",
    rating: "movies.rating",
  };
  const column = columns[sort] || "movies.title";
  const direction = order === "desc" ? "DESC" : "ASC";

  const sql = `
  SELECT
    movies.*,
    subgenres.name AS subgenre,
    subgenres_2.name AS subgenre_2,
    subgenres_3.name AS subgenre_3
  FROM
    movies
    JOIN subgenres ON subgenres.id = movies.subgenre_id
    LEFT JOIN subgenres AS subgenres_2 ON subgenres_2.id = movies.subgenre_2_id
    LEFT JOIN subgenres AS subgenres_3 ON subgenres_3.id = movies.subgenre_3_id
  WHERE movies.title ILIKE $1
    AND $2::text[] <@ ARRAY[subgenres.name, subgenres_2.name, subgenres_3.name]
    AND NOT (
      ARRAY[subgenres.name, subgenres_2.name, subgenres_3.name] && $3::text[]
    )
    AND (
      $4::integer IS NULL
      OR movies.id NOT IN (
        SELECT movie_id FROM watchlist WHERE user_id = $4 AND watched = true
      )
    )
  ORDER BY ${column} ${direction} NULLS LAST, movies.title
  `;
  const { rows: movies } = await db.query(sql, [
    "%" + search + "%",
    showTags,
    hideTags,
    userId,
  ]);
  return movies;
}

/** Gets one movie by its ID, with its subgenre names. */
export async function getMovieById(id) {
  const sql = `
  SELECT
    movies.*,
    subgenres.name AS subgenre,
    subgenres_2.name AS subgenre_2,
    subgenres_3.name AS subgenre_3
  FROM
    movies
    JOIN subgenres ON subgenres.id = movies.subgenre_id
    LEFT JOIN subgenres AS subgenres_2 ON subgenres_2.id = movies.subgenre_2_id
    LEFT JOIN subgenres AS subgenres_3 ON subgenres_3.id = movies.subgenre_3_id
  WHERE movies.id = $1
  `;
  const {
    rows: [movie],
  } = await db.query(sql, [id]);
  return movie;
}

/** Gets the 10 most recently logged movies. */
export async function getRecentMovies() {
  const sql = `
  SELECT
    movies.*,
    subgenres.name AS subgenre,
    subgenres_2.name AS subgenre_2,
    subgenres_3.name AS subgenre_3
  FROM
    movies
    JOIN subgenres ON subgenres.id = movies.subgenre_id
    LEFT JOIN subgenres AS subgenres_2 ON subgenres_2.id = movies.subgenre_2_id
    LEFT JOIN subgenres AS subgenres_3 ON subgenres_3.id = movies.subgenre_3_id
  ORDER BY date_logged DESC
  LIMIT 10
  `;
  const { rows: movies } = await db.query(sql);
  return movies;
}

/** Gets 4 random movies rated 4 or higher. */
export async function getRandomMovies() {
  const sql = `
  SELECT
    movies.*,
    subgenres.name AS subgenre,
    subgenres_2.name AS subgenre_2,
    subgenres_3.name AS subgenre_3
  FROM
    movies
    JOIN subgenres ON subgenres.id = movies.subgenre_id
    LEFT JOIN subgenres AS subgenres_2 ON subgenres_2.id = movies.subgenre_2_id
    LEFT JOIN subgenres AS subgenres_3 ON subgenres_3.id = movies.subgenre_3_id
  WHERE movies.rating >= 4
  ORDER BY random()
  LIMIT 4
  `;
  const { rows: movies } = await db.query(sql);
  return movies;
}

/** Gets up to 6 rated movies that share the given subgenre, liked and highest rated first. */
export async function getSimilarMovies(subgenreId, movieId) {
  const sql = `
  SELECT
    movies.*,
    subgenres.name AS subgenre,
    subgenres_2.name AS subgenre_2,
    subgenres_3.name AS subgenre_3
  FROM
    movies
    JOIN subgenres ON subgenres.id = movies.subgenre_id
    LEFT JOIN subgenres AS subgenres_2 ON subgenres_2.id = movies.subgenre_2_id
    LEFT JOIN subgenres AS subgenres_3 ON subgenres_3.id = movies.subgenre_3_id
  WHERE (
      movies.subgenre_id = $1
      OR movies.subgenre_2_id = $1
      OR movies.subgenre_3_id = $1
    )
    AND movies.id <> $2
    AND movies.rating IS NOT NULL
  ORDER BY movies.liked DESC, movies.rating DESC
  LIMIT 6
  `;
  const { rows: movies } = await db.query(sql, [subgenreId, movieId]);
  return movies;
}
