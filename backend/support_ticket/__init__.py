"""Reusable support-ticket component.

A single pluggable Django app providing:
- Tickets (with S3-compatible attachments + live-chat messages)
- Visiting logs (on-site acknowledgements)
- Dynamic options (runtime-configurable dropdowns/checklists)
- WebSocket chat (Django Channels)

It has no dependency on the host project's user model or any accounts app:
users/roles/companies are resolved through pluggable hooks, see ``conf.py``.
"""
