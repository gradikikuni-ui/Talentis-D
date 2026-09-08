"""
Envoi d'email simple via SMTP (ex: Gmail). Si SMTP_HOST n'est pas configuré
dans .env, l'envoi est silencieusement ignoré (utile en développement local
sans avoir à configurer un compte email) — la demande reste bien enregistrée
en base et visible dans /admin/employer-requests dans tous les cas.
"""
import smtplib
import ssl
from email.message import EmailMessage

from app.core.config import settings


def send_email(subject: str, body: str, to: str | None = None) -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f"[email] SMTP non configuré — email ignoré ({subject!r})")
        return False

    recipient = to or settings.NOTIFY_EMAIL

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = recipient
    msg.set_content(body)

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        # On ne fait jamais échouer la requête HTTP à cause d'un souci email :
        # la demande est déjà enregistrée en base, c'est ce qui compte le plus.
        print(f"[email] Échec de l'envoi : {e}")
        return False