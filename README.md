# Horror-Vault-Backend

A horror movie database built from my Letterboxd ratings to which help recommend and find new movies to watch

## Overview

Horror Vault is a horror movie database built from my own Letterboxd ratings and reviews. Every movie is tagged by a subgenre like "slasher", "folk horror", "found footage"... so you can browse by the kind of horror you're in the mood for based off my own appraisals of said movies and/or then find similar movies based off the tags and my ratings!

It has a sign-up/login feature so people can browse the selection and save movies to their watchlist and mark what they've watched. Every movie page suggests more picks from the same subgenre, ranked by my ratings. It's like a smaller Letterboxd, but (for now) just built around horror and sorted and presented off "Brian's"(my own) estimations of the films as an interactive movie blog of sorts.

## Tech stack

- Database: PostgreSQL
- Backend: Node.js and Express
- Data: my Letterboxd export and the TMDB API for posters

## Database schema

TODO: Update both this and API at the end

```sql
CREATE TABLE users (
  id serial PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password text NOT NULL
);

CREATE TABLE subgenres (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);

CREATE TABLE movies (
  id serial PRIMARY KEY,
  title text NOT NULL,
  year integer,
  poster_url text,
  subgenre_id integer NOT NULL REFERENCES subgenres(id) ON DELETE CASCADE,
  subgenre_2_id integer REFERENCES subgenres(id) ON DELETE CASCADE,
  subgenre_3_id integer REFERENCES subgenres(id) ON DELETE CASCADE,
  rating decimal,
  review text,
  liked boolean NOT NULL DEFAULT false,
  date_logged date
);

CREATE TABLE watchlist (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id integer NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  watched boolean NOT NULL DEFAULT false
);

CREATE TABLE comments (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id integer NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  body text NOT NULL,
  date_posted date NOT NULL DEFAULT CURRENT_DATE
);
```

## API endpoints

Users

- POST /users/register - creates a new user (users)
- POST /users/login - logs a user in (users)
- GET /users/me - gets the logged-in user's id and username (users)

Subgenres

- GET /subgenres - gets all subgenres (subgenres)

Movies

- GET /movies - gets all movies (movies, subgenres)
- GET /movies/recent - gets my most recently logged movies (movies)
- GET /movies/random - gets random highly rated movies (movies)
- GET /movies/:id - gets one movie (movies, subgenres)
- GET /movies/:id/similar - gets my highest-rated or liked movies in the same subgenre (movies)
- GET /movies/:id/comments - gets the comments on a movie (comments, users)
- POST /movies/:id/comments - adds a comment to a movie, must be logged in (comments)

Watchlist (must be logged in)

- GET /watchlist - gets the user's saved movies (watchlist, movies)
- POST /watchlist - adds a movie to the user's watchlist (watchlist)
- PUT /watchlist/:id - marks a saved movie as watched or not watched (watchlist)
- DELETE /watchlist/:id - removes a movie from the user's watchlist (watchlist)

Comments (must be logged in)

- DELETE /comments/:id - deletes the user's own comment (comments)

## Credits

Movie ratings and reviews are my own from Letterboxd. Movie posters come from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
