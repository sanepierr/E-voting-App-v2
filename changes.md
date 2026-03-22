# Backend changes log

Documentation of backend bug fixes and behavior changes. Each entry includes reproduction steps, root cause, fix, and how to verify.

---

## 1. Poll status audit log: wrong action when opening draft poll

**Date:** 2026-03-19

**Bug:** Opening a draft poll was recorded in the audit log as `REOPEN_POLL` instead of `OPEN_POLL`.

**Reproduction:**
1. Log in as admin.
2. Create a new draft poll (positions + stations assigned).
3. Assign at least one candidate to one poll position.
4. Click "Open" to open the poll.
5. Go to Admin → Audit Log.
6. **Observed:** Latest entry shows `REOPEN_POLL`.  
   **Expected:** `OPEN_POLL`.

**Root cause:** In `elections/services.py`, `PollService.toggle_status` set `poll.status = Poll.Status.OPEN` *before* computing `log_action`. The check `poll.status == Poll.Status.DRAFT` was therefore always false, so `log_action` was always `REOPEN_POLL`.

**Fix:** Compute `log_action` from the current status *before* updating `poll.status`. Then set `poll.status = Poll.Status.OPEN`.

**Files changed:** `evoting-app-backend/elections/services.py`

**Verification:** Open a new draft poll again; audit log should show `OPEN_POLL`. Reopening a closed poll should still show `REOPEN_POLL`.

---

## 2. Candidate list search: `min_age` / `max_age` broken and mutually exclusive

**Date:** 2026-03-19

**Bug:**
- Using `min_age` returned a **Python list** instead of a queryset, breaking pagination and mixing types with other filters.
- If both `min_age` and `max_age` were passed, only `min_age` applied (early `return`).
- `max_age` alone had the same list-return issue.

**Reproduction (API):**
1. `GET /api/elections/candidates/?min_age=30&max_age=40` with admin JWT.
2. **Observed:** Results ignored `max_age` (only min branch ran). With only `min_age`, response shape could break pagination expectations.

**Root cause:** `CandidateService.search` used list comprehensions over the queryset and returned early, so combined params and ORM pagination were wrong.

**Fix:** Filter `date_of_birth` using the same calendar cutoffs as `Candidate.age` (`date_of_birth__lte` / `__gte` with `_date_years_before(today, n)`). If `min_age > max_age`, return empty queryset. Invalid non-integer ages are ignored for those params.

**Files changed:** `evoting-app-backend/elections/services.py`

**Verification:**
- `?min_age=30&max_age=40` returns only candidates whose computed age is in \[30, 40\].
- `?min_age=50&max_age=30` returns no rows.
- List responses remain paginated queryset results (e.g. `count`, `next` when using DRF pagination).

---

## 3. Serializers: “inactive” checks not enforced

**Date:** 2026-03-19

**Bug:**
- **`PollCreateSerializer`:** Error text said “Invalid or inactive positions” but `position_ids` were validated only by primary key, not `is_active=True`. Inactive positions could be attached to a new poll.
- **`VoterRegistrationSerializer.validate_station_id`:** Message said “Invalid or inactive voting station” but only `pk` was checked; inactive stations were accepted.

**Reproduction:**
1. **Polls:** Deactivate a position (admin). `POST /api/elections/polls/` with that position’s id in `position_ids` — **before fix:** request succeeded. **After fix:** validation error on `position_ids`.
2. **Register:** Deactivate a station. `POST /api/accounts/register/` with that `station_id` — **before fix:** registration succeeded. **After fix:** validation error on `station_id`.

**Root cause:** Queries did not filter on `is_active=True` while user-facing errors implied they did.

**Fix:**
- `PollCreateSerializer.validate`: require `Position` rows with `pk__in=position_ids` and `is_active=True`.
- `VoterRegistrationSerializer.validate_station_id`: require `VotingStation` with `pk=value` and `is_active=True`.

**Files changed:** `evoting-app-backend/elections/serializers.py`, `evoting-app-backend/accounts/serializers.py`

**Verification:** Repeat reproduction steps; both should return 400 with field errors. Active positions/stations still work as before.

---

## 4. Admin create: `role` could be set to `voter`

**Date:** 2026-03-19

**Bug:** `POST /api/accounts/admins/create/` accepted `role: "voter"` via `AdminCreateSerializer`, which contradicts the endpoint’s purpose (create admin accounts) and could create inconsistent users (`is_staff=True` with voter role depending on service).

**Reproduction:** As super admin, `POST .../admins/create/` with body including `"role": "voter"`. **Before fix:** serializer accepted it. **After fix:** 400 — `role` not a valid choice.

**Root cause:** `ChoiceField` listed `User.Role.VOTER` among allowed values.

**Fix:** Restrict `role` choices to `User` admin roles only (`super_admin`, `election_officer`, `station_manager`, `auditor`).

**Files changed:** `evoting-app-backend/accounts/serializers.py`

**Verification:** `role: "voter"` returns validation error; valid admin roles still create users as before.

---

## 5. Closed poll results: endpoint was public (`AllowAny`)

**Date:** 2026-03-19

**Bug:** `GET /api/voting/results/closed/` used `AllowAny`, so unauthenticated clients could read all closed election results. Backend README already documented **Verified Voter** for this route.

**Reproduction:** `curl` without `Authorization` to `/api/voting/results/closed/`. **Before fix:** 200 with JSON. **After fix:** 401 Unauthorized.

**Root cause:** `ClosedPollResultsView` set `permission_classes = [AllowAny]`.

**Fix:** Use `IsVerifiedVoter` (same as other voter-only voting routes). Admins who need results continue to use `GET /api/voting/results/<poll_id>/` (allowed for admins via `IsAdminOrReadOnlyVoter`).

**Files changed:** `evoting-app-backend/voting/views.py`

**Verification:** Logged-in verified voter → 200 on `/voting/results/closed/`. No token → 401. Voter Results page (uses JWT) still loads when logged in.

---

## 6. Automated regression tests

**Date:** 2026-03-19

**Added:** Django tests covering fixes above:

| Area | Tests |
|------|--------|
| Poll audit | `OPEN_POLL` when opening draft; `REOPEN_POLL` when reopening closed |
| Candidate search | Combined `min_age`/`max_age`; empty when `min_age > max_age` |
| Serializers | Inactive position rejected in poll create; inactive station in registration |
| Admin create | `role: voter` invalid |
| Closed results | Unauthenticated → 401; verified voter → 200 |

**Files added:** `evoting-app-backend/evoting/tests/__init__.py`, `evoting-app-backend/evoting/tests/test_bugfixes.py`

**Run:**

```bash
cd evoting-app-backend && python manage.py test evoting.tests.test_bugfixes
```
