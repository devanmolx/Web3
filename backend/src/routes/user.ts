import { Router } from "express";
import jwt from "jsonwebtoken"
import prisma from "../utils/prisma.ts";

const router: Router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "";

router.post("/signin", async (req, res) => {
   
    const {walletAddress} = req.body;

    const existingUser = await prisma.user.findFirst({
        where:{
            address: walletAddress
        }
    })

    let token;

    if(existingUser){

        token = jwt.sign({
            userId: existingUser.id
        },JWT_SECRET)

    }
    else{

        const newUser = await prisma.user.create({
            data:{
                address:walletAddress
            }
        })

        token = jwt.sign({
            userId: newUser.id
        },JWT_SECRET)

    }    

    return res.status(200).json({token , status:true});
});

export default router;
