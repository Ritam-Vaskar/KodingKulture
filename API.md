# 🔌 API Documentation

Base URL: `http://localhost:5000/api`

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "college": "MIT",
  "phone": "+1234567890"
}

Response: {
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": { ... }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "success": true,
  "token": "jwt_token",
  "user": { ... }
}
```

### Get Profile
```http
GET /auth/me
Authorization: Bearer {token}

Response: {
  "success": true,
  "user": { ... }
}
```

## Contest Endpoints

### Get All Contests
```http
GET /contests
GET /contests?status=LIVE

Response: {
  "success": true,
  "count": 5,
  "contests": [ ... ]
}
```

### Get Contest by ID
```http
GET /contests/:id

Response: {
  "success": true,
  "contest": { ... }
}
```

### Create Contest (Admin Only)
```http
POST /contests
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Weekly Contest #1",
  "description": "Test your coding skills",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T12:00:00Z",
  "duration": 120,
  "sections": {
    "mcq": {
      "enabled": true,
      "duration": 30,
      "totalMarks": 0
    },
    "coding": {
      "enabled": true,
      "duration": 90,
      "totalMarks": 0
    }
  },
  "rules": [
    "No cheating allowed",
    "Fair play required"
  ],
  "isPublished": true
}
```

### Register for Contest
```http
POST /contests/:id/register
Authorization: Bearer {token}

Response: {
  "success": true,
  "message": "Successfully registered"
}
```

### Get My Contests
```http
GET /contests/my-contests
Authorization: Bearer {token}

Response: {
  "success": true,
  "contests": [ ... ]
}
```

## MCQ Endpoints

### Get MCQs for Contest
```http
GET /mcq/contest/:contestId
Authorization: Bearer {token}

Response: {
  "success": true,
  "count": 10,
  "mcqs": [ ... ]
}
```

### Submit MCQ Answers
```http
POST /mcq/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "contestId": "contest_id",
  "answers": [
    {
      "questionId": "question_id",
      "selectedOptions": [0, 2],
      "timeTaken": 45
    }
  ]
}
```

### Create MCQ (Admin Only)
```http
POST /mcq
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "contestId": "contest_id",
  "question": "What is 2+2?",
  "options": [
    { "text": "3", "isCorrect": false },
    { "text": "4", "isCorrect": true },
    { "text": "5", "isCorrect": false }
  ],
  "correctAnswers": [1],
  "marks": 2,
  "negativeMarks": 0.5,
  "difficulty": "EASY",
  "category": "APTITUDE"
}
```

## Coding Problem Endpoints

### Get Problems for Contest
```http
GET /coding/contest/:contestId
Authorization: Bearer {token}

Response: {
  "success": true,
  "problems": [ ... ]
}
```

### Get Problem by ID
```http
GET /coding/:id
Authorization: Bearer {token}

Response: {
  "success": true,
  "problem": { ... }
}
```

### Create Coding Problem (Admin Only)
```http
POST /coding
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "contestId": "contest_id",
  "title": "Two Sum",
  "description": "Find two numbers that add up to target",
  "inputFormat": "First line: n, target...",
  "outputFormat": "Two space-separated integers",
  "constraints": [
    "1 <= n <= 1000",
    "Time limit: 2s"
  ],
  "examples": [
    {
      "input": "4 9\n2 7 11 15",
      "output": "0 1",
      "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
    }
  ],
  "testcases": [
    {
      "input": "4 9\n2 7 11 15",
      "output": "0 1",
      "hidden": false,
      "points": 20
    },
    {
      "input": "5 10\n1 2 3 4 5",
      "output": "2 4",
      "hidden": true,
      "points": 30
    }
  ],
  "score": 100,
  "difficulty": "EASY",
  "timeLimit": 2,
  "memoryLimit": 256,
  "tags": ["array", "hash-table"]
}
```

## Submission Endpoints

### Submit Code
```http
POST /submissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "contestId": "contest_id",
  "problemId": "problem_id",
  "sourceCode": "def solution():\n    return [0, 1]",
  "language": "python"
}

Response: {
  "success": true,
  "submission": {
    "id": "submission_id",
    "verdict": "ACCEPTED",
    "score": 100,
    "testcasesPassed": 10,
    "totalTestcases": 10
  }
}
```

### Get Submissions for Problem
```http
GET /submissions/problem/:problemId
Authorization: Bearer {token}

Response: {
  "success": true,
  "submissions": [ ... ]
}
```

## Leaderboard Endpoints

### Get Contest Leaderboard
```http
GET /leaderboard/:contestId

Response: {
  "success": true,
  "count": 100,
  "leaderboard": [
    {
      "rank": 1,
      "userId": { "name": "John Doe", ... },
      "totalScore": 450,
      "mcqScore": 150,
      "codingScore": 300,
      "timeTaken": 3600
    }
  ]
}
```

### Get User Rank
```http
GET /leaderboard/:contestId/rank
Authorization: Bearer {token}

Response: {
  "success": true,
  "result": {
    "rank": 15,
    "totalScore": 320,
    ...
  }
}
```

### Get Contest Stats
```http
GET /leaderboard/:contestId/stats

Response: {
  "success": true,
  "stats": {
    "totalParticipants": 150,
    "submitted": 120,
    "averageScore": 280.5
  }
}
```

## Error Responses

All endpoints follow this error format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Authentication

Include JWT token in headers:
```
Authorization: Bearer {your_jwt_token}
```

Get token from login/register response.

## Rate Limiting

- 100 requests per 15 minutes per IP
- Applies to all `/api/*` endpoints

## Language IDs (Judge0)

```javascript
{
  'c': 50,
  'cpp': 54,
  'java': 62,
  'python': 71,
  'javascript': 63,
  'go': 60,
  'rust': 73
}
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Get Contests
```bash
curl http://localhost:5000/api/contests
```

---

**For detailed request/response examples, check the controller files in `/server/controllers/`**
