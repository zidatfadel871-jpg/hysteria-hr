const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// الصفحة الرئيسية لبوابة التوظيف Hysteria HR
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hysteria HR - بوابة التوظيف</title>
            <style>
                body { font-family: system-ui, sans-serif; background-color: #0f172a; color: #fff; text-align: center; padding: 50px 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
                h1 { color: #38bdf8; margin-bottom: 10px; }
                p { color: #94a3b8; font-size: 1.1rem; }
                .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #0284c7; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
                .btn:hover { background: #0369a1; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Hysteria HR Portal</h1>
                <p>مرحباً بك في بوابة التوظيف الخاصة بسيرفر Hysteria.</p>
                <p>السيرفر يعمل الآن بنجاح وجاهز لاستقبال الطلبات!</p>
                <a href="#" class="btn">تقديم طلب انضمام</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Hysteria HR server is running on port ${PORT}`);
});