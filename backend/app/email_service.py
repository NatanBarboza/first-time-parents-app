"""
Envio de e-mail via SMTP.
Configure no .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM.
Se não configurado, o envio é apenas logado (útil em desenvolvimento).
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def _config():
    return {
        "host": os.getenv("SMTP_HOST", "").strip(),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USER", "").strip(),
        "password": os.getenv("SMTP_PASSWORD", "").strip(),
        "from_addr": os.getenv("EMAIL_FROM", os.getenv("SMTP_USER", "noreply@listadacasa.com")).strip(),
    }


def enviar_email(destinatario: str, assunto: str, corpo_html: str, corpo_texto: str = "") -> bool:
    cfg = _config()
    if not cfg["host"] or not cfg["user"]:
        print(f"[EMAIL] (SMTP não configurado) Para: {destinatario} | Assunto: {assunto}")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = assunto
        msg["From"] = cfg["from_addr"]
        msg["To"] = destinatario
        if corpo_texto:
            msg.attach(MIMEText(corpo_texto, "plain", "utf-8"))
        msg.attach(MIMEText(corpo_html, "html", "utf-8"))
        with smtplib.SMTP(cfg["host"], cfg["port"]) as server:
            if cfg["port"] in (587, 465):
                server.starttls()
            if cfg["user"] and cfg["password"]:
                server.login(cfg["user"], cfg["password"])
            server.sendmail(cfg["from_addr"], [destinatario], msg.as_string())
        return True
    except Exception as e:
        print(f"[EMAIL] Erro ao enviar para {destinatario}: {e}")
        return False


def enviar_confirmacao_assinatura(email: str, nome: str, plano: str) -> bool:
    plano_label = "Mensal (R$ 9,90/mês)" if plano == "mensal" else "Anual (R$ 90/ano)"
    assunto = "Sua assinatura Lista da Casa foi confirmada"
    corpo_texto = f"""Olá {nome or 'usuário'},

Sua assinatura do Lista da Casa foi confirmada.

Plano: {plano_label}

Acesse o app e comece a organizar suas compras.

—
Lista da Casa
"""
    corpo_html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; color: #333;">
  <h2 style="color: #0d7a6a;">Assinatura confirmada</h2>
  <p>Olá {nome or 'usuário'},</p>
  <p>Sua assinatura do <strong>Lista da Casa</strong> foi confirmada.</p>
  <p><strong>Plano:</strong> {plano_label}</p>
  <p>Acesse o app e comece a organizar suas compras, listas e estoque.</p>
  <p style="margin-top: 32px; color: #666; font-size: 14px;">— Lista da Casa</p>
</body>
</html>
"""
    return enviar_email(email, assunto, corpo_html, corpo_texto)
