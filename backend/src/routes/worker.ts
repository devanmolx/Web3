import { Router } from "express";
import prisma from "../utils/prisma.ts";
import jwt from "jsonwebtoken"
import { workerAuthMiddleware } from "../middlewares/workerAuthMiddleware.ts";

const WORKER_JWT_SECRET = process.env.WORKER_JWT_SECRET || "";

const router: Router = Router();

router.post("/signin", async (req, res) => {
    const { walletAddress } = req.body;

    const existingWorker = await prisma.worker.findFirst({
        where: {
            address: walletAddress
        },
        include: { balance: true }
    });

    let token;

    if (existingWorker) {
        token = jwt.sign(
            {
                workerId: existingWorker.id,
            },
            WORKER_JWT_SECRET
        );
    } else {
        const newWorker = await prisma.worker.create({
            data: {
                address: walletAddress,
                balance: {
                    create: {}
                }
            },
            include: { balance: true }
        });

        token = jwt.sign(
            {
                workerId: newWorker.id,
            },
            WORKER_JWT_SECRET
        );
    }

    return res.status(200).json({ token, status: true });
});

router.get("/nextTask", workerAuthMiddleware, async (req, res) => {

    // @ts-ignore
    const workerId = req.workerId;

    try {

        const task = await prisma.task.findFirst({
            where: {
                options: {
                    some: {
                        submissions: {
                            none: { workerId }
                        }
                    }
                },
                done: false
            },
            include: { options: true }
        })

        return res.status(200).json({ task, status: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error, status: false });
    }

})



export default router;
