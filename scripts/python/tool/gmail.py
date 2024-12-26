#!/usr/bin/env python3

from rich import print
import typer
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = typer.Typer()


@app.command()
def gmail(
    gmail_user: str = typer.Option(..., "-u", help="发件人邮箱地址"),
    gmail_password: str = typer.Option(..., "-p", help="应用专用密码"),
    recipient_email: str = typer.Option(..., "-r", help="收件人邮箱地址"),
    subject: str = typer.Option(..., "--subject", help="邮件主题"),
    body: str = typer.Option(..., "--body", help="邮件正文"),
):
    """使用 Gmail 发送邮件
    应用专用密码设置: https://myaccount.google.com/apppasswords
    """
    now = datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")
    # Gmail SMTP 服务器配置
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587

    # 发件人信息
    GMAIL_USER = gmail_user
    GMAIL_PASSWORD = gmail_password

    # 收件人信息
    recipient_email = recipient_email

    # 邮件内容
    subject = subject
    body = body

    # 创建邮件对象
    message = MIMEMultipart()
    message["From"] = GMAIL_USER
    message["To"] = recipient_email
    message["Subject"] = subject

    # 添加邮件正文
    message.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_PASSWORD)

        # 发送邮件
        server.sendmail(GMAIL_USER, recipient_email, message.as_string())
        print(f"[{now}] 邮件发送成功！")
        typer.Exit(0)

    except Exception as e:
        print(f"[{now}] 邮件发送失败: {e}")
        typer.Exit(-1)

    finally:
        server.quit()


if __name__ == "__main__":
    app()
