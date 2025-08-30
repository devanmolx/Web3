import { Router } from "express";
import prisma from "../utils/prisma.ts";
import jwt from "jsonwebtoken"
import { workerAuthMiddleware } from "../middlewares/workerAuthMiddleware.ts";
import { createSubmissionType } from "../types.ts";

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

router.post("/submission", workerAuthMiddleware, async (req, res) => {

    // @ts-ignore
    const workerId = req.workerId;
    const body = req.body;

    const parsedBody = createSubmissionType.safeDecode(body);

    if (!parsedBody.success) {
        return res.status(401).json({ error: parsedBody.error, status: false });
    }

    try {

        const option = await prisma.option.findUnique({
            where: {
                id: parsedBody.data.optionId
            },
            include: { task: true }
        })

        if (!option || !option.task) {
            return res.status(400).json({ error: "No valid option", status: false })
        }

        const task = option!.task;

        if (task.totalSubmissions >= task.maxSubmissions) {
            return res.status(400).json({ error: "Max Submissions Reached", status: false })
        }

        const existingSubmission = await prisma.submission.findFirst({
            where: {
                workerId,
                option: { taskId: task.id }
            }
        });

        if (existingSubmission) {
            return res.status(400).json({ error: "Already submitted for this task", status: false });
        }

        const amount = task.amount / task.maxSubmissions
        const result = await prisma.$transaction(async tx => {

            const submission = await tx.submission.create({
                data: {
                    workerId,
                    optionId: parsedBody.data.optionId,
                    amount,
                    taskId: task.id
                }
            })

            const updatedTask = await tx.task.update({
                where: { id: task.id },
                data: {
                    totalSubmissions: { increment: 1 },
                    done: task.totalSubmissions + 1 >= task.maxSubmissions
                },
            });

            return {
                submission,
                updatedTask
            }
        });


        return res.status(200).json({ submission: result.submission, updatedTask: result.updatedTask, status: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error, status: false });
    }
})

export default router;
