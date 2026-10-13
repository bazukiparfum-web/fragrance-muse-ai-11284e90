# Send pump instructions to the machine over MQTT when a job starts

## What you will get
- When a pending job on the Production Queue page is moved to "In process" (one job or several at once), the server publishes that job's pump instructions to your HiveMQ Cloud broker, one message per job.
- The page shows a small confirmation ("Sent to machine") or a clear error if the broker could not be reached. If sending fails, the job still changes status, and a "Resend to machine" option shows on that job.

## Credentials (entered in a secure form after you approve)
- HIVEMQ_HOST: cluster URL, for example `xxxx.s1.eu.hivemq.cloud`
- HIVEMQ_USERNAME and HIVEMQ_PASSWORD: from HiveMQ Cloud, Access Management, Credentials (the user needs publish permission)
- Port 8883 (secure) is used by default.

## Topic
`#` is reserved in MQTT for listening to every topic, so it cannot be used to send. The plan uses the topic **`OrderQueue`**. Tell me if the machine expects a different name.

## Message format (one per job)
```text
{
  "job_id": "...",
  "fragrance_code": "...",
  "size": "30ml",
  "quantity": 1,
  "pumps": [ { "pump": "PUMP-01", "note": "Bergamot", "ml": 4.5 }, ... ],
  "sent_at": "ISO time"
}
```
Pump amounts come from the job's saved formula and the pump mapping set up in Ingredients/Pumps.

## Technical details
- In the existing `admin-manage-production` function, after a status update to `in_progress`, load each job's formula and map notes to pumps using the existing production formula logic, then publish over MQTT (TLS 8883, Deno `npm:mqtt`) with QoS 1.
- Return the publish result for each job in the response; the Production Queue page shows toasts and a resend action that publishes again without changing status.
- Save each send attempt (job, time, success or error) in the job's `machine_notes` for tracking.
- Admin-only access stays as it is now.
