const express = require('express');
const axios = require('axios');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'magic-hysteria-secret-9988',
    resave: false,
    saveUninitialized: false
}));

// إعدادات ديسكورد
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1499397022174674944';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'zcNjt4DCKJmbjRf__QGIM-wh24NEi_Ub';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || 'DMTQ5OTM5NTNzAyMjE3NDk0NA.GmKHE6.s4cBT2NFKczNgbUEanJXGMYMPCaFO9sBKwps3Y';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://hysteria-hr.onrender.com/auth/discord/callback';

// السيرفرات المربوطة
const GUILD_IDS = [
    '1499394752456429628', // السيرفر الأول
    '999999999999999999'  // السيرفر الثاني
];

// الرتب وصلاحياتها (عوض الآيديات بأرقام الرتب الحقيقية في سيرفرك)
const ROLES_MAP = {
    '123456789012345678': { name: 'مسؤول', badgeClass: 'admin-badge' },
    '987654321098765432': { name: 'جندي', badgeClass: 'soldier-badge' }
};

app.get('/login', (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds.members.read`;
    res.redirect(discordAuthUrl);
});

app.get('/auth/discord/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send('فشل المصادقة.');

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const user = userResponse.data;

        let userRole = { name: 'عضو عام', badgeClass: 'guest-badge' };

        for (const guildId of GUILD_IDS) {
            try {
                const memberResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/members/${user.id}`, {
                    headers: { Authorization: `Bot ${BOT_TOKEN}` }
                });
                const userRoles = memberResponse.data.roles;
                for (const roleId of userRoles) {
                    if (ROLES_MAP[roleId]) {
                        userRole = ROLES_MAP[roleId];
                        break;
                    }
                }
                if (userRole.name === 'مسؤول') break;
            } catch (err) {}
        }

        req.session.user = {
            username: user.username,
            avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png',
            role: userRole
        };

        res.redirect('/');
    } catch (error) {
        res.send('حدث خطأ أثناء الربط مع الديسكورد.');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/', (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>Hysteria Magic Studio</title>
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Tajawal', sans-serif; }
                    body { background: #090a0f; color: #fff; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden; }
                    .glow-bg { position: absolute; width: 400px; height: 400px; background: linear-gradient(135deg, #6366f1, #a855f7); filter: blur(150px); opacity: 0.3; z-index: -1; }
                    .card { background: rgba(18, 20, 32, 0.7); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); padding: 50px 40px; border-radius: 24px; max-width: 480px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
                    h1 { font-size: 2.5rem; font-weight: 900; background: linear-gradient(to right, #818cf8, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 15px; }
                    p { color: #94a3b8; font-size: 1.05rem; margin-bottom: 35px; line-height: 1.6; }
                    .btn-discord { display: inline-flex; align-items: center; justify-content: center; gap: 12px; background: #5865F2; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 12px; font-weight: bold; font-size: 1.1rem; transition: 0.3s; box-shadow: 0 4px 20px rgba(88, 101, 242, 0.4); width: 100%; }
                    .btn-discord:hover { background: #4752C4; transform: translateY(-3px); box-shadow: 0 6px 25px rgba(88, 101, 242, 0.6); }
                </style>
            </head>
            <body>
                <div class="glow-bg"></div>
                <div class="card">
                    <h1>Hysteria Magic Studio</h1>
                    <p>منصة الإبداع والذكاء والتحكم المركزية. سجّل دخولك عبر حساب ديسكورد للوصول إلى أدواتك وصلاحياتك.</p>
                    <a href="/login" class="btn-discord">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.011c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                        تسجيل الدخول عبر Discord
                    </a>
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
            <title>Hysteria Magic Studio - لوحة الأدوات</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Tajawal', sans-serif; }
                body { background: #090a0f; color: #e2e8f0; min-height: 100vh; }
                header { background: rgba(15, 18, 28, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 15px 50px; display: flex; justify-content: space-between; align-items: center; }
                .user-box { display: flex; align-items: center; gap: 15px; }
                .avatar { width: 45px; height: 45px; border-radius: 50%; border: 2px solid #818cf8; }
                .badge { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
                .logout { color: #f43f5e; text-decoration: none; font-weight: bold; font-size: 0.9rem; }
                .container { max-width: 1100px; margin: 40px auto; padding: 0 20px; }
                .welcome-banner { background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); border: 1px solid rgba(129, 140, 248, 0.2); border-radius: 20px; padding: 40px; margin-bottom: 40px; text-align: center; }
                .welcome-banner h2 { font-size: 2rem; background: linear-gradient(to right, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
                .tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
                .tool-card { background: rgba(18, 20, 32, 0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 25px; transition: 0.3s; }
                .tool-card:hover { transform: translateY(-5px); border-color: rgba(129, 140, 248, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .tool-card h3 { color: #818cf8; margin-bottom: 10px; font-size: 1.3rem; }
                .tool-card p { color: #94a3b8; font-size: 0.95rem; margin-bottom: 20px; }
                .btn-tool { display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 0.9rem; transition: 0.2s; }
                .btn-tool:hover { background: #4f46e5; }
            </style>
        </head>
        <body>
            <header>
                <div class="user-box">
                    <img src="${user.avatar}" class="avatar">
                    <div>
                        <div style="font-weight: bold; font-size: 1.05rem;">${user.username}</div>
                        <span class="badge">${user.role.name}</span>
                    </div>
                </div>
                <a href="/logout" class="logout">تسجيل الخروج</a>
            </header>

            <div class="container">
                <div class="welcome-banner">
                    <h2>أهلاً بك في استوديو Hysteria</h2>
                    <p>اختر الأداة المناسبة لبدء العمل، الصلاحيات والأدوار موزعة تلقائياً حسب رتبتك في السيرفر.</p>
                </div>

                <div class="tools-grid">
                    <div class="tool-card">
                        <h3>🎨 تصميم الجرافيك والبنرات</h3>
                        <p>تعديل وتوليد صور وبنرات مخصصة لإدارة السيرفرات باحترافية عالية.</p>
                        <a href="#" class="btn-tool">فتح الأداة</a>
                    </div>
                    <div class="tool-card">
                        <h3>⚡ بروتوكولات الإدارة والتوظيف</h3>
                        <p>مراجعة الطلبات والتحكم بالملفات والمستندات الإدارية المعتمدة.</p>
                        <a href="#" class="btn-tool">استعراض السجلات</a>
                    </div>
                    <div class="tool-card">
                        <h3>🤖 أتمتة البوتات والمهام</h3>
                        <p>إدارة الأوامر البرمجية وتتبع إشعارات الأنشطة والتفاعلات.</p>
                        <a href="#" class="btn-tool">التحكم الآلي</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Magic Studio is running on port ${PORT}`);
});
