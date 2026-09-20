import json
import os
import threading
import urllib.request

RESEND_URL = "https://api.resend.com/emails"


def notify_owner(msg):
    """Email you when someone sends a message. Does nothing if the keys are not set."""
    key = os.getenv("RESEND_API_KEY")
    to = os.getenv("CONTACT_NOTIFY_EMAIL")
    if not key or not to:
        return

    subject = (msg.subject or "No subject").replace("\n", " ").replace("\r", " ")
    body = {
        "from": os.getenv("CONTACT_FROM_EMAIL", "Portfolio <onboarding@resend.dev>"),
        "to": [to],
        "reply_to": msg.sender_email,
        "subject": f"New message: {subject}",
        "text": (
            f"From: {msg.sender_name} <{msg.sender_email}>\n"
            f"Phone: {msg.sender_phone or '-'}\n\n"
            f"{msg.message}"
        ),
    }
    data = json.dumps(body).encode()

    def send():
        req = urllib.request.Request(
            RESEND_URL,
            data=data,
            method="POST",
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "User-Agent": "portfolio-backend/1.0",
            },
        )
        try:
            urllib.request.urlopen(req, timeout=10)
        except Exception as e:  # never break the contact form because of email
            print("EMAIL ERROR:", repr(e))

    threading.Thread(target=send, daemon=True).start()