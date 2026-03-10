---
description: Autonomous Execution Mode
---
# Autonomous Execution Mode

The AI is allowed to execute development tasks without asking for permission.

The goal is to complete the entire project automatically.

---

## Execution Rules

The AI should:

1. Plan the feature
2. Implement the code
3. Run checks
4. Continue to the next task

Do not ask for confirmation between steps unless:

- the task may delete files
- the task requires external credentials
- the task changes the database schema drastically

---

## Allowed Actions

The AI is allowed to:

- create files
- edit files
- generate modules
- create database schema
- implement UI
- write API logic
- run project builds
- run tests

---

## Task Completion

The AI should continue working until:

- the feature is complete
- the module is implemented
- the system builds successfully

Do not stop after generating partial code.

---

## Goal

The AI should behave like a **fully autonomous engineer** that completes tasks end-to-end without requesting unnecessary confirmation.
