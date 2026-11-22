import db from "#db/client";
import { createMovie } from "#db/queries/movies";
import { createSubgenre } from "#db/queries/subgenres";
import { parse } from "csv-parse/sync";
import fs from "fs";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

/** Reads the movie CSV and adds every subgenre and movie to the database. */
async function seed() {
  const csv = fs.readFileSync("db/horror_movies.csv", "utf8");
  const movies = parse(csv, { columns: true });

  const subgenreIds = {};
  for (const movie of movies) {
    const names = [movie.subgenre, movie.subgenre_2, movie.subgenre_3];
    for (const name of names) {
      if (name && !subgenreIds[name]) {
        const subgenre = await createSubgenre(name);
        subgenreIds[name] = subgenre.id;
      }
    }

    const info = await getMovieInfo(movie.title, movie.year);
    await createMovie(
      movie.title,
      movie.year,
      info.posterUrl,
      info.synopsis,
      subgenreIds[movie.subgenre],
      subgenreIds[movie.subgenre_2] || null,
      subgenreIds[movie.subgenre_3] || null,
      movie.my_rating || null,
      movie.my_review || null,
      movie.liked === "yes",
      movie.date_logged,
      movie.letterboxd_url,
    );
  }
}

/** Looks up a movie on TMDB by its title and year and returns its poster and synopsis, or null for either one it doesn't have. */
async function getMovieInfo(title, year) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&year=${year}`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` } },
  );
  const result = await response.json();
  if (!response.ok) throw Error(result.status_message);

  const match =
    result.results.find((movie) => movie.title === title) ||
    result.results[0];
  if (!match) return { posterUrl: null, synopsis: null };

  const posterUrl = match.poster_path
    ? "https://image.tmdb.org/t/p/w500" + match.poster_path
    : null;
  return { posterUrl, synopsis: match.overview || null };
}
