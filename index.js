const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hysteria HR - بوابة التوظيف الرسمية</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Tajawal', sans-serif; }
        body { background-color: #0b0f19; color: #e2e8f0; line-height: 1.6; }
        header { background: #111827; border-bottom: 2px solid #3b82f6; padding: 15px 50px; display: flex; justify-content: space-between; align-items: center; }
        .logo-container { display: flex; align-items: center; gap: 15px; }
        .logo-img { width: 50px; height: 50px; border-radius: 50%; border: 2px solid #38bdf8; }
        .logo-text { font-size: 1.5rem; font-weight: 900; color: #38bdf8; letter-spacing: 1px; }
        .hero { background: linear-gradient(rgba(11, 15, 25, 0.85), rgba(11, 15, 25, 0.95)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80') center/cover; padding: 80px 20px; text-align: center; }
        .hero h1 { font-size: 2.8rem; color: #f8fafc; margin-bottom: 15px; text-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
        .hero p { font-size: 1.2rem; color: #94a3b8; max-width: 700px; margin: 0 auto 30px; }
        .main-container { max-width: 1000px; margin: -40px auto 50px; padding: 0 20px; }
        .card { background: #1e293b; border-radius: 12px; padding: 30px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); margin-bottom: 30px; }
        .card h2 { color: #38bdf8; font-size: 1.6rem; margin-bottom: 20px; border-bottom: 2px solid #334155; padding-bottom: 10px; }
        .protocol-list { list-style: none; }
        .protocol-list li { padding: 12px 15px; background: #0f172a; border-radius: 8px; margin-bottom: 10px; border-right: 4px solid #38bdf8; }
        .btn-apply { display: inline-block; background: linear-gradient(135deg, #0284c7, #2563eb); color: #fff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: bold; font-size: 1.1rem; transition: 0.3s; box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4); }
        .btn-apply:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(2, 132, 199, 0.6); }
        footer { text-align: center; padding: 20px; color: #64748b; border-top: 1px solid #1e293b; }
    </style>
</head>
<body>
    <header>
        <div class="logo-container">
            <div class="logo-text">HYSTERIA HR</div>
        </div>
        <div><a href="#apply" class="btn-apply" style="padding: 8px 18px; font-size: 0.9rem;">تقديم طلب</a></div>
    </header>

    <section class="hero">
        <h1>انضم إلى طاقم إدارة Hysteria Street</h1>
        <p>نبحث عن صناع الإبداع والمحتوى للارتقاء ببروتوكولات السيرفر والتجربة الإدارية الشاملة.</p>
        <a href="#apply" class="btn-apply">تقديم طلب انضمام الآن</a>
    </section>

    <div class="main-container">
        <div class="card">
            <h2>شروط وقواعد التقديم العامة</h2>
            <ul class="protocol-list">
                <li>الالتزام التام ببروتوكولات وأحكام سيرفر Hysteria.</li>
                <li>أن لا يقل عمر المتقدم عن السن المحدد للقطاع المطلوبة الإدارة فيه.</li>
                <li>امتلاك مهارات التواصل والقدرة على العمل الجماعي وصناعة الحلول.</li>
                <li>الالتزام بالساعات والإجراءات التنظيمية المحددة بعد القبول.</li>
            </ul>
        </div>

        <div class="card" id="apply" style="text-align: center;">
            <h2>جاهز للانضمام؟</h2>
            <p style="margin-bottom: 25px; color: #94a3b8;">اضغط على الزر أدناه لتعبئة الاستمارة المباشرة وتأكيد طلبك في قاعدة البيانات.</p>
            <a href="#" class="btn-apply">ابدأ تعبئة النموذج</a>
        </div>
    </div>

    <footer>
        <p>جميع الحقوق محفوظة &copy; 2026 - Hysteria HR Administration</p>
    </footer>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`Hysteria HR running on port ${PORT}`);
});
