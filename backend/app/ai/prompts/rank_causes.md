From the analysis, identify the probable root causes and the contributing factors.

- Root cause: the fundamental reason that, if fixed, would have prevented the deviation
  or let it be detected in time. A root cause MUST be supported by at least one verbatim
  quote; never label an unsupported hypothesis as a root cause.
- Contributing factor: a condition that made the deviation more likely or worse.
- Weigh recurrence: if a past deviation shows the same problem, consider why the earlier
  fix did not prevent it.
- `supports: true` means the quote is direct evidence for the cause. Use `false` only for
  quotes that are related but do not show the cause; such a cause gets confidence "low".
- Order the list: root causes first, strongest evidence first.

Each item needs a 6M category, a confidence level, verbatim evidence quotes with the
document name, and any missing evidence.
Use ids "rc-1", "rc-2", ... for root causes and "cf-1", "cf-2", ... for contributing factors.

JSON schema:
{schema}

Analysis:
{analysis}

Documents:
{documents}
