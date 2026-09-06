const express = require('express');
const axios = require('axios');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'hysteria-hr-secret-key',
    resave: false,
    saveUninitialized: false
}));

// بيانات الديسكورد الخاصة بسيرفرك
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1499397022174674944';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'zcNjt4DCKJmbjRf__QGIM-wh24NEi_Ub';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || 'DMTQ5OTM5NTNzAyMjE3NDk0NA.GmKHE6.s4cBT2NFKczNgbUEanJXGMYMPCaFO9sBKwps3Y';
const GUILD_ID = process.env.DISCORD_GUILD_ID || '1499394752456429628';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://hysteria-hr.onrender.com/auth/discord/callback';

// خريطة الرتب (ضع هنا Role IDs الحقيقية من سيرفر الديسكورد)
const ROLES_MAP = {
    '123456789012345678': 'مسؤول',  // استبدل هذا الرقم بـ Role ID المسؤولين
    '987654321098765432': 'جندي',   // استبدل هذا الرقم بـ Role ID الجنود
};

app.get('/login', (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds.members.read`;
    res.redirect(discordAuthUrl);
});

app.get('/auth/discord/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send('فشل عملية تسجيل الدخول عبر الديسكورد.');

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const user = userResponse.data;

        let assignedRole = 'عضو';
        try {
            const memberResponse = await axios.get(`https://discord.com/api/guilds/${GUILD_ID}/members/${user.id}`, {
                headers: { Authorization: `Bot ${BOT_TOKEN}` }
            });
            const userRoles = memberResponse.data.roles;

            for (const roleId of userRoles) {
                if (ROLES_MAP[roleId]) {
                    assignedRole = ROLES_MAP[roleId];
                    break;
                }
            }
        } catch (botErr) {
            console.log('لم يتم العثور على العضو في السيرفر أو البوت يفتقر للصلاحيات');
        }

        req.session.user = {
            username: user.username,
            avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png',
            role: assignedRole
        };

        res.redirect('/');
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.send('حدث خطأ أثناء الاتصال بـ Discord. التأكد من صلاحيات البوت وربط Redirect URI.');
    }
});

app.get('/', (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>Hysteria HR - تسجيل الدخول</title>
                <style>
                    body { font-family: system-ui, sans-serif; background-color: #0f172a; color: #fff; text-align: center; padding: 80px 20px; }
                    .card { max-width: 500px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
                    h1 { color: #38bdf8; margin-bottom: 10px; }
                    .btn-discord { display: inline-block; margin-top: 25px; padding: 12px 30px; background: #5865F2; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
                    .btn-discord:hover { background: #4752C4; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Hysteria HR Portal</h1>
                    <p>بوابة التوظيف الرسمية الخاصة بسيرفر Hysteria</p>
                    <a href="/login" class="btn-discord">تسجيل الدخول عبر Discord</a>
                </div>
            </body>
            </html>
        `);
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>Hysteria HR - لوحة التحكم</title>
            <style>
                body { font-family: system-ui, sans-serif; background-color: #0f172a; color: #fff; text-align: center; padding: 50px 20px; }
                .card { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; }
                .avatar { width: 90px; height: 90px; border-radius: 50%; border: 3px solid #38bdf8; }
                .role-badge { display: inline-block; padding: 6px 16px; background: #0284c7; color: white; border-radius: 20px; font-weight: bold; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="card">
                <img src="${user.avatar}" class="avatar">
                <h2>أهلاً بك، ${user.username}</h2>
                <div>الرتبة في السيرفر: <span class="role-badge">${user.role}</span></div>
                <hr style="margin: 30px 0; border-color: #334155;">
                <p>${user.role === 'مسؤول' ? 'أهلاً بك يا قائد، لديك صلاحيات كاملة لإدارة الطلبات.' : 'يمكنك الآن تعبئة طلب الانضمام ومتابعة حالة ملفك.'}</p>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Hysteria HR running on port ${PORT}`);
});
