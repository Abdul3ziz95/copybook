// app.js

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. المتغيرات الأساسية وواجهة المستخدم (Bottom Sheet & Toast)
    // ----------------------------------------------------
    const bottomSheet = document.getElementById('bottom-sheet');
    const fabAddExpense = document.getElementById('fab-add-expense');
    const closeBtn = document.getElementById('close-bottom-sheet');
    const toastElement = document.getElementById('toast-message');
    const contentArea = document.getElementById('content-area');

    const sheetFormArea = document.getElementById('sheet-form-area');
    const sheetTitle = document.getElementById('sheet-title');


    // إظهار Bottom Sheet
    const showBottomSheet = (title = 'معاملة جديدة') => {
        sheetTitle.textContent = title;
        bottomSheet.classList.add('visible');
    };

    // إخفاء Bottom Sheet
    const hideBottomSheet = () => {
        bottomSheet.classList.remove('visible');
        // تفريغ النموذج عند الإخفاء
        const currentForm = sheetFormArea.querySelector('form');
        if (currentForm) {
             currentForm.reset();
        }
    };

    // عرض رسالة Toast 
    const showToast = (message) => {
        toastElement.textContent = message;
        toastElement.classList.add('show');
        setTimeout(() => {
            toastElement.classList.remove('show');
        }, 3000);
    };

    // ----------------------------------------------------
    // 2. نظام التوجيه (Simple Router)
    // ----------------------------------------------------

    const routes = {
        '/': renderHome,
        '/expenses': renderExpensesLog,
        '/debt': renderDebtManager,
    };

    // دالة التنقل (موضوعة في النطاق العام للتشغيل من HTML)
    async function navigateTo(path) {
        const renderer = routes[path];
        if (renderer) {
            contentArea.innerHTML = await renderer(); 
            history.pushState({}, '', path);
        } else {
            contentArea.innerHTML = `<h2>404 - الصفحة غير موجودة</h2>`;
        }
    }
    window.navigateTo = navigateTo;
    
    // ----------------------------------------------------
    // 3. معالجات إرسال النماذج
    // ----------------------------------------------------
    
    // معالج إضافة المصروف
    async function handleAddExpense(event) {
        event.preventDefault(); 

        const form = document.getElementById('add-expense-form'); 
        if (!form) return;

        const expenseData = {
            amount: parseFloat(form.amount.value),
            category: form.category.value,
            note: form.note.value || '',
            date: new Date().toISOString(),
            type: 'expense'
        };

        if (isNaN(expenseData.amount) || expenseData.amount <= 0) {
            showToast("الرجاء إدخال مبلغ صحيح.");
            return;
        }

        try {
            await db.addExpense(expenseData); 
            showToast(`تم حفظ مصروف بقيمة ${expenseData.amount.toFixed(2)} ريال.`);
            form.reset(); 
            hideBottomSheet();
            navigateTo('/'); 
        } catch (error) {
            console.error("Error saving expense:", error);
            showToast("فشل حفظ المصروف.");
        }
    }

    // معالج إضافة الدين
    async function handleAddDebt(event) {
        event.preventDefault();

        const form = document.getElementById('add-debt-form');
        if (!form) return;

        const debtData = {
            name: form.name.value,
            amount: parseFloat(form.amount.value),
            type: form.type.value, 
            note: form.note.value || '',
            status: form.status.value, 
            date: new Date().toISOString(),
            transactionType: 'debt'
        };

        if (isNaN(debtData.amount) || debtData.amount <= 0) {
            showToast("الرجاء إدخال مبلغ صحيح.");
            return;
        }

        try {
            await db.addDebt(debtData);
            showToast(`تم حفظ سجل الدين لـ ${debtData.name}.`);
            form.reset();
            hideBottomSheet();
            navigateTo('/debt'); 
        } catch (error) {
            console.error("Error saving debt:", error);
            showToast("فشل حفظ سجل الدين.");
        }
    }


    // ----------------------------------------------------
    // 4. الدوال المساعدة لعرض النماذج (Sheets)
    // ----------------------------------------------------
    
    // دالة إظهار نموذج إضافة المصروفات
    function showAddExpenseSheet() {
         sheetFormArea.innerHTML = `
            <form id="add-expense-form" class="form-container">
                <label for="amount">المبلغ (بالريال):</label>
                <input type="number" id="amount" name="amount" placeholder="0.00" required>

                <label for="category">الفئة:</label>
                <select id="category" name="category" required>
                    <option value="طعام ومشروبات">طعام ومشروبات</option>
                    <option value="مواصلات">مواصلات</option>
                    <option value="فواتير">فواتير</option>
                    <option value="تسلية">تسلية</option>
                    <option value="أخرى">أخرى</option>
                </select>

                <label for="note">ملاحظات (اختياري):</label>
                <input type="text" id="note" name="note" placeholder="شراء قهوة الصباح">
                
                <button type="submit" class="btn-submit">حفظ المصروف</button>
            </form>
        `;
        showBottomSheet('إضافة مصروف جديد');
        // ربط المعالج لضمان عمل زر الحفظ
        document.getElementById('add-expense-form').addEventListener('submit', handleAddExpense);
    }
    
    // دالة إظهار نموذج إضافة الدين (موضوعة في النطاق العام)
    function showAddDebtSheet() {
        sheetFormArea.innerHTML = `
            <form id="add-debt-form" class="form-container">
                <label for="debt-type">نوع الدين:</label>
                <select id="debt-type" name="type" required>
                    <option value="liability">دين عليّ (مستحق)</option>
                    <option value="asset">دين لي (مطلوب)</option>
                </select>

                <label for="debt-name">الاسم/الجهة:</label>
                <input type="text" id="debt-name" name="name" placeholder="اسم المقترض/المُقرض" required>

                <label for="debt-amount">المبلغ (بالريال):</label>
                <input type="number" id="debt-amount" name="amount" placeholder="0.00" required>

                <label for="debt-note">ملاحظات (اختياري):</label>
                <input type="text" id="debt-note" name="note" placeholder="سبب الدين، تاريخ الاستحقاق..">

                <label for="debt-status">الحالة:</label>
                <select id="debt-status" name="status" required>
                    <option value="unpaid">غير مسدد</option>
                    <option value="paid">تم السداد</option>
                </select>
                
                <button type="submit" class="btn-submit">حفظ سجل الدين</button>
            </form>
        `;
        showBottomSheet('إضافة سجل دين');
        // ربط المعالج لضمان عمل زر الحفظ
        document.getElementById('add-debt-form').addEventListener('submit', handleAddDebt);
    }
    window.showAddDebtSheet = showAddDebtSheet;


    // ----------------------------------------------------
    // 5. دالات عرض الصفحات (Async Render Functions)
    // ----------------------------------------------------

    // دالة عرض الصفحة الرئيسية
    async function renderHome() {
        const expenses = await db.getExpenses();
        const debts = await db.getDebts();
        
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2);
        
        // دمج المصروفات والديون في سجل واحد للعرض في الصفحة الرئيسية (لأحدث 5)
        const allTransactions = [...expenses.map(e => ({...e, isDebt: false})), 
                                 ...debts.map(d => ({...d, isDebt: true}))]
                                 .sort((a, b) => new Date(b.date) - new Date(a.date));

        let transactionListHTML = '';
        if (allTransactions.length > 0) {
            allTransactions.slice(0, 5).forEach(t => {
                const date = new Date(t.date).toLocaleDateString('ar-SA');
                
                if (!t.isDebt) {
                    transactionListHTML += `
                        <div class="transaction-list-item" onclick="navigateTo('/expenses')">
                            <div class="item-details">
                                <h4>${t.category}</h4>
                                <p>${date} | ${t.note || 'مصروف عام'}</p>
                            </div>
                            <span class="expense-amount">-${t.amount.toFixed(2)} ر.س</span>
                        </div>
                    `;
                } else {
                    const color = t.type === 'asset' ? '#28a745' : '#dc3545';
                    const sign = t.type === 'asset' ? '+' : '-';
                    const label = t.type === 'asset' ? 'دين لي' : 'دين عليّ';
                    if (t.status === 'unpaid') {
                        transactionListHTML += `
                            <div class="transaction-list-item debt-item" onclick="navigateTo('/debt')" style="border-right: 4px solid ${color};">
                                <div class="item-details">
                                    <h4 style="color: ${color};">${label} - ${t.name}</h4>
                                    <p>${date} | (${t.status === 'paid' ? 'تم السداد' : 'غير مسدد'})</p>
                                </div>
                                <span class="debt-amount" style="color: ${color}; font-weight: bold;">${sign}${t.amount.toFixed(2)} ر.س</span>
                            </div>
                        `;
                    }
                }
            });
        } else {
            transactionListHTML = '<p style="text-align: center; color: #999;">لا يوجد سجلات معاملات بعد.</p>';
        }

        return `
            <h2>👋 ملخص الميزانية</h2>
            <div class="summary-card" style="padding: 15px; background: #ffe0e6; border-radius: 10px; margin-bottom: 20px; border-right: 5px solid #dc3545;">
                <h3>إجمالي المصروفات المسجلة:</h3>
                <p style="font-size: 24px; font-weight: bold; color: #dc3545;">${totalExpenses} ريال</p>
            </div>
            
            <h3>آخر المعاملات</h3>
            <div id="latest-transactions-list" style="margin-bottom: 30px;">
                ${transactionListHTML}
            </div>

            <h3 style="margin-top: 20px;">تنقل سريع</h3>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button onclick="navigateTo('/expenses')" class="btn-submit" style="background-color: #007bff; flex-grow: 1;">سجل المصروفات</button>
                <button onclick="navigateTo('/debt')" class="btn-submit" style="background-color: #ffc107; color: #333; flex-grow: 1;">إدارة الديون</button>
            </div>
        `;
    }

    // دالة عرض سجل المصروفات
    async function renderExpensesLog() {
        const expenses = await db.getExpenses();
        
        let listHTML = '';
        expenses.slice().reverse().forEach(exp => {
            const date = new Date(exp.date).toLocaleDateString('ar-SA', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
            listHTML += `
                <div class="transaction-list-item" data-id="${exp.id}">
                    <div class="item-details">
                        <h4>${exp.category}</h4>
                        <p>${date} | ${exp.note || 'لا توجد ملاحظة'}</p>
                    </div>
                    <span class="expense-amount">-${exp.amount.toFixed(2)} ر.س</span>
                </div>
            `;
        });
        
        return `
            <h2>سجل المصروفات 🧾</h2>
            <p style="margin-bottom: 20px; color: #777;">${expenses.length} مصروف مسجل. (التعديل والحذف يضاف في المرحلة 5)</p>
            <div id="expense-full-log">
                ${listHTML.length > 0 ? listHTML : '<p style="text-align: center;">لا يوجد مصروفات في السجل.</p>'}
            </div>
        `;
    }
    
    // دالة عرض إدارة الديون
    async function renderDebtManager() {
        const debts = await db.getDebts();
        const assets = debts.filter(d => d.type === 'asset');
        const liabilities = debts.filter(d => d.type === 'liability');

        const totalAssets = assets.reduce((sum, d) => sum + (d.status === 'unpaid' ? d.amount : 0), 0).toFixed(2);
        const totalLiabilities = liabilities.reduce((sum, d) => sum + (d.status === 'unpaid' ? d.amount : 0), 0).toFixed(2);
        
        let debtListHTML = '';
        const allDebts = [...assets, ...liabilities].sort((a, b) => new Date(b.date) - new Date(a.date));

        allDebts.forEach(debt => {
            const typeLabel = debt.type === 'asset' ? 'لك (مطلوب)' : 'عليك (مستحق)';
            const statusClass = debt.status === 'paid' ? 'status-paid' : 'status-unpaid';
            const amountSign = debt.type === 'asset' ? '+' : '-';
            const color = debt.type === 'asset' ? '#28a745' : '#dc3545'; 
            
            debtListHTML += `
                <div class="transaction-list-item debt-item ${statusClass}" data-id="${debt.id}" data-type="debt">
                    <div class="item-details">
                        <h4 style="color: ${color};">${debt.name} (${typeLabel})</h4>
                        <p>${debt.note || 'لا توجد ملاحظة'}</p>
                        <span class="debt-status ${statusClass}">${debt.status === 'paid' ? 'تم السداد' : 'غير مسدد'}</span>
                    </div>
                    <span class="debt-amount" style="color: ${color}; font-weight: bold;">${amountSign}${debt.amount.toFixed(2)} ر.س</span>
                </div>
            `;
        });

        return `
            <h2>إدارة الديون 🤝</h2>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <div class="summary-card" style="flex: 1; border-right: 5px solid #28a745;">
                    <h3>ديون لك (غير مسدد)</h3>
                    <p style="font-size: 20px; color: #28a745; font-weight: bold;">${totalAssets} ر.س</p>
                </div>
                <div class="summary-card" style="flex: 1; border-right: 5px solid #dc3545;">
                    <h3>ديون عليك (غير مسدد)</h3>
                    <p style="font-size: 20px; color: #dc3545; font-weight: bold;">${totalLiabilities} ر.س</p>
                </div>
            </div>
            
            <button onclick="showAddDebtSheet()" class="btn-submit" style="background-color: #ffc107; color: #333; margin-top: 0; margin-bottom: 20px;">+ إضافة سجل دين جديد</button>

            <h3>سجل الديون الحالي (${allDebts.length})</h3>
            <div id="debt-full-log">
                ${debtListHTML.length > 0 ? debtListHTML : '<p style="text-align: center;">لا يوجد سجلات ديون.</p>'}
            </div>
        `;
    }

    // ----------------------------------------------------
    // 6. ربط الأحداث الرئيسية (Initialization)
    // ----------------------------------------------------

    fabAddExpense.addEventListener('click', showAddExpenseSheet);

    closeBtn.addEventListener('click', hideBottomSheet);

    bottomSheet.addEventListener('click', (e) => {
        if (e.target === bottomSheet) {
            hideBottomSheet();
        }
    });

    // معالجة التنقل عند النقر على أزرار المتصفح (Back/Forward)
    window.addEventListener('popstate', () => {
        navigateTo(location.pathname);
    });

    // تحميل الصفحة الافتراضية عند بدء التطبيق
    navigateTo(location.pathname === '/' ? '/' : location.pathname);
    
    setTimeout(() => {
        showToast("تطبيق Smart Budget جاهز للعمل!");
    }, 1000);
});
