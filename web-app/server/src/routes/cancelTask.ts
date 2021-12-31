import {RequestHandler} from "express";
import {Pool} from "pg";
import queryString from "querystring";

const cancelTaskHandler: RequestHandler<{}, any, any, queryString.ParsedUrlQueryInput> =
    (req, res) => {
  if (!req.query || !req.query.taskID) {
    return res.sendStatus(400);
  }
  try {
    const pool: Pool = req.app.get("pool");
    const query =
        `update ${process.env.DB_TASKS_TABLE_NAME}
         set cancelled = true
         where taskID = '${req.query.taskID}'`;
    (
      async () => {
        await pool.query(query)
            .then((result) => {
              if (result !== undefined && result.rowCount === 1) {
                res.send(result);
                console.debug(`Task with ID = '${req.query.taskID}'
                    was cancelled`);
              } else {
                console.error(`Invalid taskID,
                    task with ID = '${req.query.taskID}' wasn't cancelled`);
              }
            })
            .catch((err) => {
              console.log(err);
              res.status(400).send(err);
            });
      }
    )();
  } catch (err) {
    res.status(500).send("Unexpected problem caught: " + err);
  }
};

export = cancelTaskHandler;