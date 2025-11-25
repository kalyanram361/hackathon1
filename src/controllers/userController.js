import pool from "../config/db.js";

export const getUserProfile= async (req,res)=>{
    try{
        const userId =req.user.id;
        const result =await pool.query(
            "select id,name,email,role,created_at from users where id =$1",
            [userId]
        );
        if(result.rows.length ===0){
            return res.status(404).json({error : "User not found"});
        }
        res.json(result.rows[0]);
    } catch(error){
        console.error("Error fetching user profile:",error);
        res.status(500).json({error: "Internal server error"});
    }
};

export const getUserReports =async(req,res)=>{
    try{
        const userId =req.user.id;
        const result = await pool.query(
            "select * from reports where user_id =$1 order by created_at desc",
            [userId]
        );
        res.json(result.rows);
    } catch(error){
        console.error("Error fetching user reports:",error);
        res.status(500).json({error : "Internal server error"});
    }
};

export const getdashboardStats =async(req,res)=>{
    try{
        const userId =req.user.id;

        //Get user's reports count by status
        const userStats = await pool.query(`
            SELECT 
                COUNT(*) as total_reports,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reports,
                COUNT(CASE WHEN status = 'in progress' THEN 1 END) as in_progress_reports,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports
            FROM reports WHERE user_id = $1
        `, [userId]);

        //Get nearby issues (you can modify this based on location logic)
         const nearbyIssues = await pool.query(
            "SELECT COUNT(*) as nearby_count FROM reports WHERE status != 'resolved'"
        );

        res.json({
            userReports : userStats.rows[0],
            nearbyIssues : nearbyIssues.rows[0].nearby_count
        });
    }catch(error){
        console.error("Error fetching dashboard stats:",error);
        res.status(500).json({error:"Internal server error"});
    }
};