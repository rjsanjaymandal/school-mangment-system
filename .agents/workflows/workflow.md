---
description: System Roles and Authentication Workflows
---
# System Workflows

---

## Teacher Account Creation

1. Admin opens dashboard
2. Admin clicks "Add Teacher"
3. Admin enters teacher details
4. System creates user account
5. System sends password setup email
6. Teacher sets password
7. Teacher logs in

---

## Student Account Creation

1. Admin opens student module
2. Admin creates student profile
3. System generates student account
4. Email sent for password setup
5. Student logs in

---

## Login Workflow

1. User visits /login
2. User enters credentials
3. System authenticates using Supabase
4. System fetches role
5. User redirected to role dashboard
