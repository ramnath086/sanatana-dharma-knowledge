# Editorial Activity Log

`WorkflowEvent` models append-only activity entries with actor, action, entity, previous state, new state, timestamp and reason. The current static implementation validates and displays session transitions but does not persist them.

A production workbench should append events to protected server-side storage, never expose internal comments or activity logs through public generated JSON, and require authorization for each action.
