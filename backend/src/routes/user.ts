import { Router } from "express";
import jwt from "jsonwebtoken"
import prisma from "../utils/prisma.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTaskInput } from "../types.ts";

const router: Router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "";
const Bucket = process.env.AWS_BUCKET || "";

const s3 = new S3Client({
    region:"ap-south-1",
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY || ""
    }
})

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

router.post("/preSignedURL" , authMiddleware , async (req,res)=>{
    // @ts-ignore
    const userId = req.userId;
    const Key = `task/${userId}/${Math.random()}/image.jpg`

    try {
        
        const command = new PutObjectCommand({
            Bucket,
            Key
        })
        
        const url = await getSignedUrl(s3 , command , {expiresIn: 60*10});

        return res.status(200).json({url , key: Key, status: true});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error , status:false});   
    }
})

router.post("/task" , authMiddleware , (req,res) => {

    // @ts-ignore
    const userId:number = req.userId;

    const body = req.body;
    const parsedData = createTaskInput.safeParse(body);

    if(!parsedData.success){
        return res.status(401).json({error : parsedData.error , status:false})
    }

    const {title , options , signature , amount} = parsedData.data;

    try {
        
        
        const newTask =  prisma.$transaction(async tx => {
            
            const newTask = await tx.task.create({
                data:{
                    userId,
                    title,
                    amount,
                    signature,
                    options:{
                        create: options.map((option, index) => ({
                            imageUrl: option.imageUrl,
                            optionId: index
                        }))
                    }
                }
            })
            
            return newTask;
        })
        
        return res.status(201).json({newTask, status:true});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error , status:false});  
    }
})

export default router;
