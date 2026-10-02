import db from "../database/db";

export const updateUserLastLoggedInTime = async (userId: string): Promise<void> => {
  try {
    await db("user").withSchema("Oauth")
      .where({ id: userId })
      .update({ last_logged_in: db.fn.now() });
  } catch (error) {
    console.error("Error updating last logged in time:", error);
  }
};
