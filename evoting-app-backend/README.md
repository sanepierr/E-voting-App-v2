# E-Voting System — Django REST Framework API

A fully functional electronic voting system built with Django and Django REST Framework,
featuring JWT authentication, role-based access control, full audit logging, and
comprehensive election management.

---

## Quick Start

```bash
pip install django djangorestframework djangorestframework-simplejwt

python manage.py makemigrations accounts elections voting audit
python manage.py migrate
python manage.py seed_admin
python manage.py runserver
```

Default admin credentials: `admin` / `admin123`

---

## Architecture

```
evoting/          → Project settings, root URL config
accounts/         → User model, auth (JWT), voter/admin management
elections/        → Candidates, Voting Stations, Positions, Polls
voting/           → Vote casting, results, statistics
audit/            → Audit trail logging
```

Each app follows a layered architecture:

| Layer          | File              | Responsibility                        |
|----------------|-------------------|---------------------------------------|
| Models         | `models.py`       | Data schema and domain properties     |
| Serializers    | `serializers.py`  | Validation, input/output shaping      |
| Services       | `services.py`     | Business logic and orchestration      |
| Views          | `views.py`        | HTTP handling, delegates to services  |
| Permissions    | `permissions.py`  | Role-based access control             |
| URLs           | `urls.py`         | Route registration                    |

---

## Authentication

All protected endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Obtain Tokens

| Endpoint                           | Method | Body                                        |
|------------------------------------|--------|---------------------------------------------|
| `/api/accounts/login/admin/`       | POST   | `{"username", "password"}`                  |
| `/api/accounts/login/voter/`       | POST   | `{"voter_card_number", "password"}`         |
| `/api/accounts/token/refresh/`     | POST   | `{"refresh": "<refresh_token>"}`            |

---

## API Endpoints

### Accounts

| Endpoint                                      | Method | Auth       | Description              |
|-----------------------------------------------|--------|------------|--------------------------|
| `/api/accounts/register/`                     | POST   | Public     | Voter self-registration  |
| `/api/accounts/profile/`                      | GET    | Voter      | View voter profile       |
| `/api/accounts/change-password/`              | POST   | Any        | Change own password      |
| `/api/accounts/voters/`                       | GET    | Admin      | List/search voters       |
| `/api/accounts/voters/<id>/verify/`           | POST   | Admin      | Verify a voter           |
| `/api/accounts/voters/verify-all/`            | POST   | Admin      | Verify all pending       |
| `/api/accounts/voters/<id>/deactivate/`       | POST   | Admin      | Deactivate voter         |
| `/api/accounts/admins/`                       | GET    | Admin      | List admins              |
| `/api/accounts/admins/create/`                | POST   | SuperAdmin | Create admin account     |
| `/api/accounts/admins/<id>/deactivate/`       | POST   | SuperAdmin | Deactivate admin         |

**Voter search params:** `?name=`, `?card=`, `?national_id=`, `?station_id=`

### Elections

| Endpoint                                        | Method     | Auth          | Description                |
|-------------------------------------------------|------------|---------------|----------------------------|
| `/api/elections/candidates/`                    | GET / POST | Admin (write) | List / create candidates   |
| `/api/elections/candidates/<id>/`               | GET / PATCH| Admin (write) | Detail / update candidate  |
| `/api/elections/candidates/<id>/deactivate/`    | POST       | Admin         | Soft-delete candidate      |
| `/api/elections/stations/`                      | GET / POST | Admin (write) | List / create stations     |
| `/api/elections/stations/<id>/`                 | GET / PATCH| Admin (write) | Detail / update station    |
| `/api/elections/stations/<id>/deactivate/`      | POST       | Admin         | Soft-delete station        |
| `/api/elections/positions/`                     | GET / POST | Admin (write) | List / create positions    |
| `/api/elections/positions/<id>/`                | GET / PATCH| Admin (write) | Detail / update position   |
| `/api/elections/positions/<id>/deactivate/`     | POST       | Admin         | Soft-delete position       |
| `/api/elections/polls/`                         | GET / POST | Admin (write) | List / create polls        |
| `/api/elections/polls/<id>/`                    | GET        | Any auth      | Poll detail with positions |
| `/api/elections/polls/<id>/update/`             | PATCH      | Admin         | Update draft/closed poll   |
| `/api/elections/polls/<id>/delete/`             | DELETE     | Admin         | Delete non-open poll       |
| `/api/elections/polls/<id>/toggle-status/`      | POST       | Admin         | Open or close a poll       |
| `/api/elections/polls/assign-candidates/`       | POST       | Admin         | Assign candidates to poll  |

**Candidate search params:** `?name=`, `?party=`, `?education=`, `?min_age=`, `?max_age=`

### Voting

| Endpoint                                  | Method | Auth           | Description                 |
|-------------------------------------------|--------|----------------|-----------------------------|
| `/api/voting/open-polls/`                 | GET    | Verified Voter | Polls available to vote in  |
| `/api/voting/cast/`                       | POST   | Verified Voter | Cast vote                   |
| `/api/voting/history/`                    | GET    | Verified Voter | View own voting history     |
| `/api/voting/results/<poll_id>/`          | GET    | Any auth       | Full poll results           |
| `/api/voting/results/<poll_id>/stations/` | GET    | Admin          | Station-wise breakdown      |
| `/api/voting/results/closed/`             | GET    | Verified Voter | All closed poll results     |
| `/api/voting/statistics/`                 | GET    | Admin          | System-wide statistics      |

### Audit

| Endpoint                       | Method | Auth  | Description                 |
|--------------------------------|--------|-------|-----------------------------|
| `/api/audit/logs/`             | GET    | Admin | Paginated audit log         |
| `/api/audit/action-types/`     | GET    | Admin | List distinct action types  |

**Audit log filter params:** `?action=`, `?user=`

---

## Roles & Permissions

| Role              | Access Level                                   |
|-------------------|------------------------------------------------|
| `super_admin`     | Full access, can create/deactivate admins      |
| `election_officer`| Manage polls, candidates, positions, stations  |
| `station_manager` | Manage stations, verify voters                 |
| `auditor`         | Read-only access to all admin endpoints        |
| `voter`           | Cast votes, view own profile/history/results   |

---

## Example: Cast a Vote

```json
POST /api/voting/cast/
Authorization: Bearer <voter_token>

{
  "poll_id": 1,
  "votes": [
    {
      "poll_position_id": 1,
      "candidate_id": 3,
      "abstain": false
    },
    {
      "poll_position_id": 2,
      "candidate_id": null,
      "abstain": true
    }
  ]
}
```

Response:
```json
{
  "detail": "Your vote has been recorded successfully.",
  "vote_reference": "f4b880d755eb5e73"
}
```

---

## Example: Create a Poll

```json
POST /api/elections/polls/
Authorization: Bearer <admin_token>

{
  "title": "2026 General Election",
  "description": "National election",
  "election_type": "General",
  "start_date": "2026-03-01",
  "end_date": "2026-03-31",
  "position_ids": [1, 2],
  "station_ids": [1, 2, 3]
}
```

---

## Business Rules

- Voters must be verified by an admin before they can log in or vote
- Candidates must be 25–75 years old with no criminal record
- Voters must be at least 18 years old
- Each voter can only vote once per poll (enforced at DB level)
- Open polls cannot be modified or deleted
- Candidates in active polls cannot be deactivated
- Positions in active polls cannot be deactivated
- Every state-changing action is recorded in the audit log
- Passwords are hashed via Django's built-in PBKDF2
- Voter card numbers are auto-generated 12-char alphanumeric strings
- Vote hashes provide tamper-evidence receipts
