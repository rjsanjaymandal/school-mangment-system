---
description: Database Schema Structure Overview
---
# Database Schema

Database: PostgreSQL

---

## users

id
email
password
role
status
created_at

---

## profiles

id
user_id
full_name
phone
created_at

---

## students

id
user_id
admission_number
class_id
parent_id

---

## teachers

id
user_id
department
subject

---

## classes

id
name
section
teacher_id

---

## subjects

id
name
class_id
teacher_id

---

## attendance

id
student_id
class_id
date
status

---

## exams

id
class_id
exam_name
date

---

## marks

id
exam_id
student_id
subject_id
marks

---

## fees

id
student_id
amount
due_date
status

---

## payments

id
fee_id
amount
payment_date
method
