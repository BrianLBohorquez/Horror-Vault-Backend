import express from "express";
const router = express.Router();
export default router;

import {
  getMovies,
  getMovieById,
  getRecentMovies,
  getRandomReviewedMovie,
  getRandomMovies,
  getSimilarMovies,
} from "#db/queries/movies";
import { createComment, getCommentsByMovieId } from "#db/queries/comments";
import {
  createVote,
  getVotesByMovieId,
  getVoteByUserAndMovie,
  updateVoteById,
} from "#db/queries/votes";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

router.get("/", async (req, res) => {
  const {
    search = "",
    show = "",
    hide = "",
    sort = "title",
    order = "asc",
    watched = "",
  } = req.query;
  const showTags = show ? show.split(",") : [];
  const hideTags = hide ? hide.split(",") : [];
  const userId = req.user && watched === "hide" ? req.user.id : null;
  const movies = await getMovies(
    search,
    showTags,
    hideTags,
    sort,
    order,
    userId,
  );
  res.send(movies);
});

router.get("/recent", async (req, res) => {
  const movies = await getRecentMovies();
  res.send(movies);
});

router.get("/random", async (req, res) => {
  const reviewedMovie = await getRandomReviewedMovie();
  const movies = await getRandomMovies(reviewedMovie.id);
  res.send([reviewedMovie, ...movies]);
});

router.param("id", async (req, res, next, id) => {
  const movie = await getMovieById(id);
  if (!movie) return res.status(404).send("Movie not found.");
  req.movie = movie;
  next();
});

router.get("/:id", (req, res) => {
  res.send(req.movie);
});

router.get("/:id/similar", async (req, res) => {
  const movies = await getSimilarMovies(req.movie.subgenre_id, req.movie.id);
  res.send(movies);
});

router.get("/:id/comments", async (req, res) => {
  const comments = await getCommentsByMovieId(req.movie.id);
  res.send(comments);
});

router.post(
  "/:id/comments",
  requireUser,
  requireBody(["body"]),
  async (req, res) => {
    const { body } = req.body;
    const comment = await createComment(req.user.id, req.movie.id, body);
    res.status(201).send(comment);
  },
);

router.get("/:id/votes", async (req, res) => {
  const votes = await getVotesByMovieId(req.movie.id);
  res.send(votes);
});

router.put(
  "/:id/votes",
  requireUser,
  requireBody(["thumbsUp"]),
  async (req, res) => {
    const { thumbsUp } = req.body;
    const vote = await getVoteByUserAndMovie(req.user.id, req.movie.id);

    if (vote) {
      const updatedVote = await updateVoteById(vote.id, thumbsUp);
      return res.send(updatedVote);
    }

    const newVote = await createVote(req.user.id, req.movie.id, thumbsUp);
    res.status(201).send(newVote);
  },
);
