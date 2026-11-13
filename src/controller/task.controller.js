import Task from "../models/task.model.js"

export const createTask = async (req, res, next) => {
    try {
        console.log("1. Incoming body:", req.body);

        const {
            title,
            description,
            priority,
            deadline,
            estimatedDuration
        } = req.body;

        console.log("2. Extracted duration:", estimatedDuration);

        const task = await Task.create({
            title,
            description,
            priority,
            deadline,
            estimatedDuration,
            createdBy: req.user._id
        });

        console.log("3. Saved duration:", task.estimatedDuration);

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task
        });

    } catch (error) {
        next(error);
    }
};

//fetc all task based on user 
export const getAllTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({
            createdBy: req.user._id
        });

        return res.status(200).json({
            success: true,
            message: "Tasks fetched successfully",
            totalTasks: tasks.length,
            data: tasks
        });

    } catch (error) {
        next(error);
    }
};


export const getSingleTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        const task = await Task.findOne({
            _id: id,
            createdBy: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task fetched successfully",
            data: task
        });

    } catch (error) {
        next(error);
    }
};

//update task

export const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updatedTask = await Task.findOneAndUpdate(
            {
                _id: id,
                createdBy: req.user._id
            },
            {
                $set: req.body
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: updatedTask
        });

    } catch (error) {
        next(error);
    }
};

//delete task

export const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deletedTask = await Task.findOneAndDelete({
            _id: id,
            createdBy: req.user._id
        });

        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
            data: deletedTask
        });

    } catch (error) {
        next(error);
    }
};

//task helper to detect cycle

const wouldCreateCycle = async (taskId, dependencyId, userId) => {
    const visited = new Set();
    const stack = [dependencyId.toString()];

    while (stack.length > 0) {
        const currentId = stack.pop();

        if (currentId === taskId.toString()) {
            return true;
        }

        if (visited.has(currentId)) {
            continue;
        }

        visited.add(currentId);

        const task = await Task.findOne({
            _id: currentId,
            createdBy: userId
        }).select("dependencies");

        if (!task) {
            return true;
        }

        for (const dependency of task.dependencies) {
            stack.push(dependency.toString());
        }
    }

    return false;
};


export const addTaskDependency = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { dependencyId } = req.body;
        const userId = req.user._id;

        // 1. Prevent a task from depending on itself
        if (id === dependencyId) {
            return res.status(400).json({
                success: false,
                message: "A task cannot depend on itself"
            });
        }

        // 2. Check whether both tasks belong to the logged-in user
        const task = await Task.findOne({
            _id: id,
            createdBy: userId
        });

        const dependencyTask = await Task.findOne({
            _id: dependencyId,
            createdBy: userId
        });

        if (!task || !dependencyTask) {
            return res.status(404).json({
                success: false,
                message: "Task or dependency not found"
            });
        }

        // 3. Check whether dependency already exists
        const alreadyExists = task.dependencies.some(
            dep => dep.toString() === dependencyId
        );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Dependency already exists"
            });
        }

        // 4. Check for circular dependency
        const hasCycle = await wouldCreateCycle(
            id,
            dependencyId,
            userId
        );

        if (hasCycle) {
            return res.status(400).json({
                success: false,
                message: "Adding this dependency would create a cycle"
            });
        }

        // 5. Add dependency without creating duplicates
        const updatedTask = await Task.findOneAndUpdate(
            {
                _id: id,
                createdBy: userId
            },
            {
                $addToSet: {
                    dependencies: dependencyId
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Task dependency added successfully",
            data: updatedTask
        });

    } catch (error) {
        next(error);
    }
};

//get depencies task

export const getTaskDependencies = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Find the task belonging to the logged-in user
        const task = await Task.findOne({
            _id: id,
            createdBy: userId
        })
        .select("title description priority status deadline dependencies")
        .populate({
            path: "dependencies",
            match: { createdBy: userId },
            select: "title description priority status deadline"
        });

        // Check whether task exists
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Remove any dependencies that could not be populated
        const dependencies = task.dependencies.filter(Boolean);

        return res.status(200).json({
            success: true,
            message: "Task dependencies fetched successfully",
            data: {
                task: {
                    _id: task._id,
                    title: task.title
                },
                totalDependencies: dependencies.length,
                dependencies
            }
        });

    } catch (error) {
        next(error);
    }
};

//tasdk exploration using BFS
export const getTaskDependentsBFS = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // 1. Fetch all tasks belonging to this user
        const allTasks = await Task.find({
            createdBy: userId
        })
        .select("_id title priority status dependencies")
        .lean();

        // 2. Find the starting task
        const startTask = allTasks.find(
            task => task._id.toString() === id
        );

        if (!startTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // 3. Build an adjacency list
        const graph = new Map();

        for (const task of allTasks) {
            for (const dependencyId of task.dependencies || []) {
                const prerequisiteId = dependencyId.toString();

                if (!graph.has(prerequisiteId)) {
                    graph.set(prerequisiteId, []);
                }

                // This task depends on prerequisiteId
                graph.get(prerequisiteId).push(task);
            }
        }

        // 4. Initialize BFS
        const queue = [{
            id: id,
            level: 0
        }];

        const visited = new Set([id]);
        const traversalOrder = [];

        // 5. Perform BFS
        while (queue.length > 0) {
            const current = queue.shift();

            const dependents = graph.get(current.id) || [];

            for (const dependent of dependents) {
                const dependentId = dependent._id.toString();

                if (visited.has(dependentId)) {
                    continue;
                }

                visited.add(dependentId);

                const nextLevel = current.level + 1;

                traversalOrder.push({
                    _id: dependent._id,
                    title: dependent.title,
                    priority: dependent.priority,
                    status: dependent.status,
                    level: nextLevel
                });

                queue.push({
                    id: dependentId,
                    level: nextLevel
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "BFS traversal completed",
            data: {
                startTask: {
                    _id: startTask._id,
                    title: startTask.title
                },
                totalDependents: traversalOrder.length,
                traversalOrder
            }
        });

    } catch (error) {
        next(error);
    }
};

//topological order

export const getTaskTopologicalOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all tasks belonging to logged-in user
    const tasks = await Task.find({ createdBy: userId })
      .select("_id title priority status dependencies")
      .lean();

    // 2. Create graph and indegree map
    const graph = new Map();
    const indegree = new Map();

    for (const task of tasks) {
      const taskId = task._id.toString();

      graph.set(taskId, []);
      indegree.set(taskId, 0);
    }

    // 3. Build graph: prerequisite -> dependent task
    for (const task of tasks) {
      const taskId = task._id.toString();

      for (const dependency of task.dependencies || []) {
        const dependencyId = dependency.toString();

        if (!graph.has(dependencyId)) continue;

        graph.get(dependencyId).push(taskId);

        indegree.set(
          taskId,
          indegree.get(taskId) + 1
        );
      }
    }

    // 4. Add all zero-indegree nodes to queue
    const queue = [];

    for (const [taskId, degree] of indegree) {
      if (degree === 0) {
        queue.push(taskId);
      }
    }

    // 5. Process queue
    const sortedTasks = [];

    while (queue.length > 0) {
      const currentId = queue.shift();

      const currentTask = tasks.find(
        task => task._id.toString() === currentId
      );

      sortedTasks.push(currentTask);

      const neighbours = graph.get(currentId) || [];

      for (const neighbourId of neighbours) {
        const newDegree = indegree.get(neighbourId) - 1;

        indegree.set(neighbourId, newDegree);

        if (newDegree === 0) {
          queue.push(neighbourId);
        }
      }
    }

    // 6. Detect cycle
    if (sortedTasks.length !== tasks.length) {
      return res.status(400).json({
        success: false,
        message: "Cycle detected. Topological sorting is not possible."
      });
    }

    // 7. Return result
    return res.status(200).json({
      success: true,
      message: "Topological sorting completed",
      totalTasks: sortedTasks.length,
      data: sortedTasks
    });

  } catch (error) {
    next(error);
  }
};

//greedy approches

export const getGreedySchedule = async (req, res, next) => {
  try {
    // 1. Fetch the logged-in user's tasks
    const tasks = await Task.find({
      createdBy: req.user._id
    }).lean();

    // 2. Separate completed tasks
    const completedIds = new Set(
      tasks
        .filter(task => task.status === "completed")
        .map(task => task._id.toString())
    );

    const pendingTasks = tasks.filter(
      task => task.status !== "completed"
    );

    // 3. Create graph and indegree
    const graph = new Map();
    const indegree = new Map();

    for (const task of pendingTasks) {
      const id = task._id.toString();
      graph.set(id, []);
      indegree.set(id, 0);
    }

    // 4. Build dependency graph
    for (const task of pendingTasks) {
      const taskId = task._id.toString();

      for (const dependency of task.dependencies) {
        const dependencyId = dependency.toString();

        // Completed dependencies are already satisfied
        if (completedIds.has(dependencyId)) continue;

        // Ignore dependencies outside pending tasks
        if (!graph.has(dependencyId)) continue;

        graph.get(dependencyId).push(taskId);

        indegree.set(
          taskId,
          indegree.get(taskId) + 1
        );
      }
    }

    // 5. Find tasks with no remaining dependencies
    const readyTasks = pendingTasks.filter(
      task => indegree.get(task._id.toString()) === 0
    );

    const priorityWeight = {
      high: 3,
      medium: 2,
      low: 1
    };

    const scheduledTasks = [];

    // 6. Greedy selection
    while (readyTasks.length > 0) {

      readyTasks.sort((a, b) => {
        const priorityDifference =
          priorityWeight[b.priority] -
          priorityWeight[a.priority];

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        // Tasks with deadlines come before tasks without deadlines
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;

        return new Date(a.deadline) - new Date(b.deadline);
      });

      // Select the best currently available task
      const currentTask = readyTasks.shift();

      scheduledTasks.push(currentTask);

      const currentId = currentTask._id.toString();

      // 7. Unlock dependent tasks
      for (const dependentId of graph.get(currentId)) {
        const newDegree = indegree.get(dependentId) - 1;

        indegree.set(dependentId, newDegree);

        if (newDegree === 0) {
          const dependentTask = pendingTasks.find(
            task => task._id.toString() === dependentId
          );

          readyTasks.push(dependentTask);
        }
      }
    }

    // 8. Detect cycles
    if (scheduledTasks.length !== pendingTasks.length) {
      return res.status(400).json({
        success: false,
        message: "Cycle detected. Cannot generate schedule."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Greedy schedule generated successfully",
      data: scheduledTasks
    });

  } catch (error) {
    next(error);
  }
};






// Remove a single dependency from a task
// DELETE /api/tasks/:id/dependencies/:depId
export const removeTaskDependency = async (req, res, next) => {
  try {
    const { id, depId } = req.params;
    const userId = req.user._id;

    // Verify the task belongs to the logged-in user
    const task = await Task.findOne({ _id: id, createdBy: userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Validate that depId looks like a valid ObjectId before querying
    if (!/^[0-9a-fA-F]{24}$/.test(depId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dependency ID format"
      });
    }

    // Check the dependency actually exists on this task
    const exists = task.dependencies.some(
      dep => dep.toString() === depId
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Dependency not found on this task"
      });
    }

    // Remove the dependency using $pull
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { $pull: { dependencies: depId } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Dependency removed successfully",
      data: updatedTask
    });

  } catch (error) {
    next(error);
  }
};
