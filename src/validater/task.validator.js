import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(120),

  description: z.string().trim().min(5).max(2000),

  priority: z.enum(["low", "medium", "high"]).optional(),

  deadline: z.coerce.date().optional()
});

//task updation
export const updateTaskSchema = z.object({
    title: z.string().trim().min(3).max(120),

    description: z.string().trim().min(5).max(2000),

    priority: z.enum(["low", "medium", "high"]).optional(),

    deadline: z.coerce.date().optional(),

    estimatedDuration: z.coerce.number()
        .int()
        .min(1)
        .max(1000)
        .optional()
}).strict().refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required"
    }
);

//task dependices validation
export const addDependencySchema = z.object({
    dependencyId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid dependency ID")
}).strict();
