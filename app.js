// app.js

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. وظائف واجهة المستخدم الأساسية (Bottom Sheet & Toast)
    // ----------------------------------------------------
    const bottomSheet = document.getElementById('bottom-sheet');
    const fabAddExpense = document.getElementById('fab-add-expense');
    const closeBtn = bottomSheet.querySelector('.close-btn');
    const toastElement = document.getElementById('toast-message');

    // إظهار Bottom Sheet
    const showBottomSheet = (title = 'معاملة جديدة') => {
        bottomSheet.querySelector('h3').textContent = title;
        bottomSheet.classList.add('visible');
    };

    // إخفاء Bottom Sheet
    const hideBottomSheet = () => {
        bottomSheet.classList.remove('visible');
    };

    // عرض رسالة Toast (إشعار غير مزعج)
    const showToast = (message) => {
        toastElement.textContent = message;
        toastElement.classList.add('show');
        setTimeout(() => {
            toastElement.classList.remove('show');
        }, 3000);
    };

    // ربط الأحداث
    fabAddExpense.addEventListener('click', () => {
        showBottomSheet('إضافة مصروف');
        // هنا يمكنك تحميل نموذج "إضافة مصروف" إلى content-area
        console.log('FAB Clicked: Show Add Expense Form');
    });

    closeBtn.addEventListener('click', hideBottomSheet);

    // إغلاق Bottom Sheet عند النقر على الخلفية المعتمة
    bottomSheet.addEventListener('click', (e) => {
        if (e.target === bottomSheet) {
            hideBottomSheet();
        }
    });

    // ----------------------------------------------------
    // 2. نظام التوجيه (Simple Router)
    // ----------------------------------------------------
    const contentArea = document.getElementById('content-area');

    // الدالات التي تولد محتوى الصفحات
    const routes = {
        '/': renderHome,
        '/expenses': renderExpensesLog,
        '/debt': renderDebtManager,
        // يمكن إضافة المزيد لاحقًا
    };

    function navigateTo(path) {
        const renderer = routes[path];
        if (renderer) {
            contentArea.innerHTML = renderer();
            // تحديث رابط المتصفح (اختياري لكن مفضل لتطبيقات SPA)
            history.pushState({}, '', path);
        } else {
            contentArea.innerHTML = `<h2>404 - الصفحة غير موجودة</h2>`;
        }
    }

    // مثال على دالة عرض الصفحة الرئيسية
    function renderHome() {
        // **هنا سيتم استدعاء storage.js في المرحلة 3 لعرض الملخص المالي**
        return `
            <h2>👋 ملخص الميزانية</h2>
            <div class="summary-card">
                <h3>إجمالي المصروفات (هذا الشهر):</h3>
                <p class="amount">0.00 ريال</p>
            </div>
            <button onclick="navigateTo('/expenses')" class="btn-primary">عرض سجل المصروفات</button>
            <button onclick="navigateTo('/debt')" class="btn-secondary">إدارة الديون</button>
        `;
    }

    // مثال على دالة عرض سجل المصروفات
    function renderExpensesLog() {
        return `
            <h2>سجل المصروفات 🧾</h2>
            <p>جاري تحميل المصروفات...</p>
        `;
    }

    // مثال على دالة عرض إدارة الديون
    function renderDebtManager() {
        return `
            <h2>إدارة الديون 🤝</h2>
            <p>ديون لك (Assets): 0.00 ريال</p>
            <p>ديون عليك (Liabilities): 0.00 ريال</p>
        `;
    }

    // معالجة التنقل عند النقر على أزرار المتصفح (Back/Forward)
    window.addEventListener('popstate', () => {
        navigateTo(location.pathname);
    });

    // تحميل الصفحة الافتراضية عند بدء التطبيق
    navigateTo(location.pathname === '/' ? '/' : location.pathname);

    // مثال على استخدام الـ Toast
    setTimeout(() => {
        showToast("مرحباً بك في Smart Budget!");
    }, 1000);
});
