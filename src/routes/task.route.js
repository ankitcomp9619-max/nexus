import express from "express";

import { createTask } from "../controller/task.controller.js";
import { getAllTasks } from "../controller/task.controller.js";
import { getSingleTask } from "../controller/task.controller.js";
import { updateTask } from "../controller/task.controller.js";
import { deleteTask } from "../controller/task.controller.js";

import { updateTaskSchema } from "../validater/task.validator.js";

// task dependencies
import { addTaskDependency } from "../controller/task.controller.js";
import { addDependencySchema } from "../validater/task.validator.js";
import { getTaskDependencies } from "../controller/task.controller.js";
import { removeTaskDependency } from "../controller/task.controller.js";

// BFS
import { getTaskDependentsBFS } from "../controller/task.controller.js";

// topological sort
import { getTaskTopologicalOrder } from "../controller/task.controller.js";

// greedy scheduler
import { getGreedySchedule } from "../controller/task.controller.js";

import { protect } from "../middlewar/auth.middlewar.js";
import { validate } from "../middlewar/validate.middlewar.js";
import { createTaskSchema } from "../validater/task.validator.js";

const router = express.Router();

// ── Static routes first (must come before /:id to avoid route shadowing) ──────
router.get("/topological-sort", protect, getTaskTopologicalOrder);
router.get("/schedule/greedy",  protect, getGreedySchedule);

// ── Task CRUD ─────────────────────────────────────────────────────────────────
router.post("/",    protect, validate(createTaskSchema), createTask);
router.get("/",     protect, getAllTasks);
router.get("/:id",  protect, getSingleTask);
router.patch("/:id", protect, validate(updateTaskSchema), updateTask);
router.delete("/:id", protect, deleteTask);

// ── Dependency management ─────────────────────────────────────────────────────
router.post("/:id/dependencies",         protect, validate(addDependencySchema), addTaskDependency);
router.get("/:id/dependencies",          protect, getTaskDependencies);
router.delete("/:id/dependencies/:depId", protect, removeTaskDependency);

// ── BFS traversal ─────────────────────────────────────────────────────────────
router.get("/:id/dependents/bfs", protect, getTaskDependentsBFS);

export default router;
