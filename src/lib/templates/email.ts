export function generateCaptchaEmailHTML(captcha: number, quickFillURL: string): string {
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moonveil Verification Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
            text-align: center;
        }
        .container {
            border: 1px solid #ccc;
            padding: 20px;
            max-width: 500px;
            margin: 0 auto;
            text-align: center;
        }
        .logo {
            margin: 20px 0;
            width: 175px;
            height: auto;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .code {
            background-color: #f2f2f2;
            padding: 10px 0;
            font-size: 24px;
            margin: 20px 0;
        }
        a {
            color: #000;
            text-decoration: underline;
        }
        .footer {
            margin-top: 40px;
            font-size: 14px;
        }
        .gray {
            color: #505050;
        }
    </style>
</head>
<body>
<div class="container">
    <img class="logo" src="https://d3dhz6pjw7pz9d.cloudfront.net/logo/logo.png" alt="Moonveil Logo">
    <p class="gray">Welcome to Moonveil Entertainment! 🚀</p>
    <p class="gray">Here's your verification code to kickoff your journey</p>
    <div class="code">${captcha}</div>
    <p class="gray">Please click <a href="${quickFillURL}">here</a> to enter the code and complete the verification.<br>
        Please keep the code to yourself and don't share with anyone.</p>
    <hr>
    <p class="gray">Please note that this is an automated message, so there is no need to reply. If you have any questions or need further help, feel free to reach out to us anytime at [<a href="mailto:contact@moonveil.studio">contact@moonveil.studio</a>]</p>
    <p class="gray">Welcome aboard!</p>
    <hr>
    <div class="footer gray">
        <p>Follow Us</p>
        <a href="https://discord.com/invite/NyECfU5XFX">Discord</a> | <a href="https://twitter.com/Moonveil_Studio">Twitter</a> | <a href="https://t.me/+AeiqS8o2YmswYTgx">Telegram</a> | <a href="https://medium.com/@Moonveil_Studio">Medium</a>
        <p>Copyright &copy; ${currentYear} Moonveil Entertainment.</p>
    </div>
</div>
</body>
</html>
    `
}