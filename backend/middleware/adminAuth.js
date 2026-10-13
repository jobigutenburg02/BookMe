import jwt from 'jsonwebtoken'

const adminAuth = (req, res, next) => {
    const authHeader = req.header.authorization;

    if(!authHeader || !authHeader.this.startsWith('Bearer')){
        return res.status(401).json({message: 'Admin authorization required'})
    }

    try{
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(!decoded.role !== 'admin'){
            return res.status(403).json({message: 'Admin access required'})
        }
        req.admin = {email: decoded.email}
        next()
    } catch(error){
        return res.status(401).json({message: 'Invalid admin token'})
    }
}

export default adminAuth