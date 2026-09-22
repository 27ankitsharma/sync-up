---
type: lesson
lesson_id: 02-when-to-build-an-agent
course_id: course-agent-definition
title: Necessary and Sufficient Conditions for Agent
order: 2
status: published
duration_minutes: 4
---

## Necessary and Sufficient Conditions for a System to be called an Agent

| Necessary condition            | What it means                                                                                                         |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **1. Goal-directed**            | The system is working toward an explicit or implicit goal/outcome.                                                   |
| **2. Autonomous decision-making** | It can decide **what action to take next** rather than only executing a predetermined sequence.                      |
| **3. Ability to act**           | It can take actions that affect its environment, typically through tools, APIs, software systems, or other interfaces. |

Hence concise definition becomes-

> [!TIP]
> **An AI agent is a goal-directed system that can independently decide and take actions to achieve an objective.**


## What about memory and feedback?

These are important agent characteristics but not necessary ones.

| Characteristic              | Necessary? | Why                                                                                     |
|-----------------------------|------------|-----------------------------------------------------------------------------------------|
| Goal                        | **Yes**    | Without a goal, there is nothing for the system to pursue.                             |
| Autonomous decision-making  | **Yes**    | This is what distinguishes an agent from a simple execution pipeline.                   |
| Ability to act              | **Yes**    | An agent needs some ability to affect its environment.                                  |
| Tools                       | No         | An agent can potentially act through other interfaces.                                 |
| Memory                      | **No**     | A stateless agent can still make decisions and act.                                     |
| Learning                    | **No**     | An agent doesn't have to learn during execution.                                       |
| Feedback loop               | **No**     | Very useful for many agents, but a simple agent can act without iterative feedback.     |
| Multiple steps              | **No**     | Common, but not fundamental to the definition.                                          |
| LLM                         | **No**     | Agents existed before LLMs and need not necessarily use one.                           |



### Necessary:

> [!TIP]
> **Goal + Decision + Action → Agent**

### Common extensions:

> [!TIP]
> **Memory + Tools + Feedback + Planning + Learning → More capable agent**


> **An agent doesn't necessarily need to learn, remember, or use an LLM to be called an agent. It needs to pursue a goal, make decisions autonomously, and take actions toward that goal.**