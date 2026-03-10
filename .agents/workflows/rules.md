---
description: Development Rules and Guidelines
---
# Development Rules

The AI must follow these rules when generating code.

## Code Quality

- use TypeScript
- follow modular architecture
- keep components reusable
- avoid duplicated code

## Security

- never expose Supabase service role key
- implement Row Level Security
- validate all inputs

## Performance

- prefer server components when possible
- optimize database queries
- avoid unnecessary client state

## Project Organization

Use clear folder structure:

app/
components/
lib/
database/
utils/
middleware.ts
