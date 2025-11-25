import pool from "../config/db.js";
import fs from "fs";
import path from "path";

export const createReport = async (req,res)=>{
    try{
        const {title,description,category,severity,location,status,user_id,latitude,longitude}=req.body;
        const image = req.file ? req.file.filename : null;

        // Validate required fields
        if (!title || !description || !category || !severity || !location || !user_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

         const newReport= await pool.query(
            `INSERT INTO reports 
            (title, description, category, severity, location, status, user_id, image_url, latitude, longitude)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [title, description, category, severity, location, status || "pending", user_id, image, latitude || null, longitude || null]
        );
        res.status(201).json(newReport.rows[0]);
    } catch (error) {
        console.error("Error creating report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//list all reports
export const getReports= async (req,res)=>{
    try{
        const {status,location} = req.query;
        let query =`select * from reports where 1=1`;
        let values =[];

        if(status){
            values.push(status);
            query += ` and status = $${values.length}`;
        }
        if(location){
            values.push(location);
            query += `and location = $${values.length}`;
        }
        const result= await pool.query(query,values);
        res.json(result.rows);
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
};

// get single report 
export const getReportbyId= async (req,res)=>{
    try{
        const {id }=req.params;
        const result= await pool.query(`select * from reports where id = $1`, [id]);
        if(result.rows.length === 0){
            return res.status(404).json({error: "Report not found"});
        }
        res.json(result.rows[0]);
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
}

//update status of the report
export const updateReportStatus = async (req,res)=>{
    try{
        const {id}=req.params;
        const {status}=req.body;
        const userId = req.user?.id || req.user?.userId; // Get user ID from token

        // Validate status
        const validStatuses = ['pending', 'in progress', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Check if report exists and belongs to user
        const reportCheck = await pool.query(
            `SELECT user_id FROM reports WHERE id = $1`, [id]
        );

        if (reportCheck.rows.length === 0) {
            return res.status(404).json({ error: "Report not found" });
        }
         // Allow update only if user owns the report OR user is admin/authority
        if (reportCheck.rows[0].user_id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: "You can only update your own reports" });
        }

        const updated= await pool.query(
            `UPDATE reports SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
            [status, id]
        );

        if( updated.rows.length ===0){
           return res.status(404).json({error:"Report not found"});
        }
        res.json(updated.rows[0]);
    }
    catch(err){
        console.error('Error updating report status:', err);
        res.status(500).json({error:err.message});
    }
};

export const deleteReport =async (req,res)=>{
    try{
        const {id}=req.params;
        const userId = req.user?.id || req.user?.userId; // Get user ID from token

        // Check if report exists and belongs to user
        const reportCheck = await pool.query(
            `SELECT user_id, image_url FROM reports WHERE id = $1`, [id]
        );

        if (reportCheck.rows.length === 0) {
            return res.status(404).json({ error: "Report not found" });
        }

        // Allow deletion only if user owns the report OR user is admin
        if (reportCheck.rows[0].user_id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: "You can only delete your own reports" });
        }
         //Optional : delete image file from uploads folder 
        if(reportCheck.rows[0]?.image_url){
            const imagePath = path.join("uploads", reportCheck.rows[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const deleted= await pool.query(`DELETE FROM reports 
            WHERE id=$1 RETURNING *`,[id]);
        
        if(deleted.rows.length === 0){
            return res.status(404).json({error:"Report not found"});
        }
        res.json({message:"Report deleted successfully"});
    }
    catch(err){
        console.error('Error deleting report:', err);
        res.status(500).json({error: err.message});
    }
};