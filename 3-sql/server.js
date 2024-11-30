const express = require("express");
const { Pool } = require("pg");
const pool = new Pool({
    connectionString:
        "postgresql://postgres:mysecretpassword@localhost:5432/message_boards",
});

async function init() {
    const app = express();

    app.get("/get", async (req, res) => {
        const client = await pool.connect();
        const [commentsRes, boardRes] = await Promise.all([
            client.query(
                // SQL injection here
                `SELECT * FROM comments NATURAL LEFT JOIN rich_content WHERE board_id = ${req.query.board_id}`

                // A variant without SQL injection
                // "SELECT * FROM comments NATURAL LEFT JOIN rich_content WHERE board_id = $1",
                // [req.query.search]
            ),
            client.query("SELECT * FROM boards WHERE board_id = $1", [
                req.query.board_id,
            ]),
        ]);
        res
            .json({
                status: "ok",
                board: boardRes.rows[0] || {},
                posts: commentsRes.rows || [],
            })
            .end();
        await client.end();
    });

    const PORT = process.env.PORT || 3000;
    app.use(express.static("./static"));
    app.listen(PORT);

    console.log(`running on http://localhost:${PORT}`);
}
init();