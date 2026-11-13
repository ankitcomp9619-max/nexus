import {z} from "zod"

//validation for register
export const registerSchema = z.object({
    username:z.string().trim().optional(),

    email:z.string().trim().email().max(254),

     password: z.string()
    .min(8)
    .max(72)
});


//validation for log in 
export const loginSchema = z.object({
  email: z.string().trim().email(),

  password: z.string().min(1).max(72)
});