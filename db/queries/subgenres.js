import db from "#db/client";

/** Adds a subgenre and returns it. */
export async function createSubgenre(name) {
  const sql = `
  INSERT INTO subgenres
    (name)
  VALUES
    ($1)
  RETURNING *
  `;
  const {
    rows: [subgenre],
  } = await db.query(sql, [name]);
  return subgenre;
}

/** Gets every subgenre in alphabetical order. */
export async function getSubgenres() {
  const sql = `
  SELECT *
  FROM subgenres
  ORDER BY name
  `;
  const { rows: subgenres } = await db.query(sql);
  return subgenres;
}
