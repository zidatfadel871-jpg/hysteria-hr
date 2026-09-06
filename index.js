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

// بيانات الديسكورد
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1499397022174674944';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'zcNjt4DCKJmbjRf__QGIM-wh24NEi_Ub';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || 'DMTQ5OTM5NTNzAyMjE3NDk0NA.GmKHE6.s4cBT2NFKczNgbUEanJXGMYMPCaFO9sBKwps3Y';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://hysteria-hr.onrender.com/auth/discord/callback';

// قائمة آيديات السيرفرين (أدخل الآيدي الخاص بالسيرفر الثاني مكان الرقم الثاني)
const GUILD_IDS = [
    '1526566119974899763', // السيرفر الأول
    '1499394752456429628'  // السيرفر الثاني (ضع ID السيرفر الثاني هنا)
];

// خريطة الرتب (ضع هنا Role IDs من السيرفرين)
const ROLES_MAP = {
    '1526566710620983359': 'مسؤول',  // Role ID مسؤول
    '1526567268522135612': 'جندي',   // Role ID جندي
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
        let foundInAnyGuild = false;

        // البحث في السيرفرين المحددين
        for (const guildId of GUILD_IDS) {
            try {
                const memberResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/members/${user.id}`, {
                    headers: { Authorization: `Bot ${BOT_TOKEN}` }
                });
                
                foundInAnyGuild = true;
                const userRoles = memberResponse.data.roles;

                for (const roleId of userRoles) {
                    if (ROLES_MAP[roleId]) {
                        assignedRole = ROLES_MAP[roleId];
                        break;
                    }
                }
                // إذا وجدنا رتبة خاصة، نكتفي بها ونخرج من حلقة البحث
                if (assignedRole !== 'عضو') break;
            } catch (err) {
                // العضو غير موجود في هذا السيرفر المحدد
            }
        }

        req.session.user = {
            username: user.username,
            avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png',
            role: assignedRole,
            isInGuild: foundInAnyGuild
        };

        res.redirect('/');
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.send('حدث خطأ أثناء الاتصال بـ Discord. التأكد من إضافة البوت للسيرفرين وترخيص المعرفات.');
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
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Hysteria HR Portal</h1>
                    <p>بوابة التوظيف الرسمية الخاصة بسيرفرات Hysteria</p>
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
                <div>الرتبة المعتمدة: <span class="role-badge">${user.role}</span></div>
                <hr style="margin: 30px 0; border-color: #334155;">
                <p>${user.role === 'مسؤول' ? 'أهلاً بك يا قائد، لديك صلاحيات كاملة لإدارة الطلبات.' : 'يمكنك الآن تقديم الطلبات ومتابعة ملفك.'}</p>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Hysteria HR running on port ${PORT}`);
});
