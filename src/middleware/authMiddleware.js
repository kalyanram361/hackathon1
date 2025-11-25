import jwt from "jsonwebtoken";

export function verifyToken(req,res,next){
    const authHeader = req.headers["authorization"];
    if(!authHeader) return res.status(401).json({message: "Missing Token"});

    const token =authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing token" });

    try{
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }
    catch{
        res.status(403).json({message : "Invalid token"});
    }
}