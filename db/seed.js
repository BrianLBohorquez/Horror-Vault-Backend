import db from "#db/client";
import { createMovie } from "#db/queries/movies";
import { createSubgenre } from "#db/queries/subgenres";
import { parse } from "csv-parse/sync";
import fs from "fs";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

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

    const posterUrl = await getPosterUrl(movie.title, movie.year);
    await createMovie(
      movie.title,
      movie.year,
      posterUrl,
      subgenreIds[movie.subgenre],
      subgenreIds[movie.subgenre_2] || null,
      subgenreIds[movie.subgenre_3] || null,
      movie.my_rating || null,
      movie.my_review || null,
      movie.liked === "yes",
      movie.date_logged,
    );
  }
}

async function getPosterUrl(title, year) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&year=${year}`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` } },
  );
  const result = await response.json();
  if (!response.ok) throw Error(result.status_message);

  const match =
    result.results.find((movie) => movie.title === title) ||
    result.results[0];
  if (!match || !match.poster_path) return null;
  return "https://image.tmdb.org/t/p/w500" + match.poster_path;
}
