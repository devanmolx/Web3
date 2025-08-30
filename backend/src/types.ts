import z from "zod";

export const createTaskInput = z.object({
  options: z.array(
    z.object({
      imageUrl: z.string(),
    })
  ),
  title: z.string(),
  signature: z.string(),
  amount: z.float64(),
});

export const createSubmissionType = z.object({
  optionId: z.number()
})