import pool from "../config/db.js";

export const addComment = async(req,res)=>{
    const reportId=req.params.id;
    const userId=req.user.id;
    const { comment } = req.body;

    if(!comment) {
        return res.status(400).json({error: "Comment is required"});
    }

    await pool.query(
        "insert into comments (user_id,report_id,comment) values($1,$2,$3)",
        [userId, reportId, comment]
    );
    res.json({message: "Comment added successfully"});
};

export const getComments = async(req,res)=>{
    const reportId =req.params.id;
    const result = await pool.query(
        "select * from comments where report_id=$1",
        [reportId]
    );
    res.json(result.rows);
};