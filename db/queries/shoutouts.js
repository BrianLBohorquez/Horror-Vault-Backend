import db from "#db/client";

/** Adds a shout out from a user and returns it. */
export async function createShoutout(userId, body) {
  const sql = `
  INSERT INTO shoutouts
    (user_id, body)
  VALUES
    ($1, $2)
  RETURNING *
  `;
  const {
    rows: [shoutout],
  } = await db.query(sql, [userId, body]);
  return shoutout;
}

/** Gets every shout out with each poster's username, newest first. */
export async function getShoutouts() {
  const sql = `
  SELECT shoutouts.*, users.username
  FROM
    shoutouts
    JOIN users ON users.id = shoutouts.user_id
  ORDER BY shoutouts.id DESC
  `;
  const { rows: shoutouts } = await db.query(sql);
  return shoutouts;
}

/** Gets one shout out by its ID. */
export async function getShoutoutById(id) {
  const sql = `
  SELECT *
  FROM shoutouts
  WHERE id = $1
  `;
  const {
    rows: [shoutout],
  } = await db.query(sql, [id]);
  return shoutout;
}

/** Deletes a shout out. */
export async function deleteShoutoutById(id) {
  const sql = `
  DELETE FROM shoutouts
  WHERE id = $1
  `;
  await db.query(sql, [id]);
}
