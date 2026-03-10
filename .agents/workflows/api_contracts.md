---
description: API Contracts and Backend Integration Patterns
---
# API Contracts

The backend uses Supabase but APIs must follow consistent patterns.

---

## Authentication

POST /api/login

Request

{
  "email": "user@email.com",
  "password": "password"
}

Response

{
  "user_id": "123",
  "role": "teacher",
  "token": "jwt_token"
}

---

## Create Student

POST /api/students

Request

{
  "name": "John Doe",
  "email": "john@email.com",
  "class_id": "CLS001"
}

Response

{
  "status": "success",
  "student_id": "STU2025-001"
}

---

## Get Students

GET /api/students

Response

[
  {
    "id": "STU001",
    "name": "John Doe",
    "class": "10A"
  }
]

---

## Mark Attendance

POST /api/attendance

Request

{
  "student_id": "STU001",
  "date": "2025-03-10",
  "status": "present"
}
