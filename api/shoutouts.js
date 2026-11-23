import express from "express";
const router = express.Router();
export default router;

import {
  createShoutout,
  getShoutouts,
  getShoutoutById,
  deleteShoutoutById,
} from "#db/queries/shoutouts";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

router.get("/", async (req, res) => {
  const shoutouts = await getShoutouts();
  res.send(shoutouts);
});

router.post("/", requireUser, requireBody(["body"]), async (req, res) => {
  const { body } = req.body;
  const shoutout = await createShoutout(req.user.id, body);
  res.status(201).send(shoutout);
});

router.param("id", async (req, res, next, id) => {
  const shoutout = await getShoutoutById(id);
  if (!shoutout) return res.status(404).send("Shout out not found.");
  req.shoutout = shoutout;
  next();
});

router.delete("/:id", requireUser, async (req, res) => {
  if (req.shoutout.user_id !== req.user.id)
    return res.status(403).send("This is not your shout out.");

  await deleteShoutoutById(req.shoutout.id);
  res.sendStatus(204);
});
