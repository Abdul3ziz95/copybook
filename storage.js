// storage.js
// تطبيق منطق IndexedDB لإدارة البيانات المحلية

const DB_NAME = 'SmartBudgetDB';
const DB_VERSION = 1;
const STORE_EXPENSES = 'expenses'; // مخزن المصروفات
const STORE_DEBTS = 'debts';       // مخزن الديون

let db; // متغير لحفظ اتصال قاعدة البيانات

/**
 * 1. تهيئة وفتح قاعدة بيانات IndexedDB
 * (الدالة الأساسية التي يتم استدعاؤها مرة واحدة)
 */
function initDB() {
    return new Promise((resolve, reject) => {
        // فتح طلب قاعدة البيانات (أو إنشاؤها إذا لم تكن موجودة)
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // هذا الحدث يتم تشغيله فقط عند إنشاء قاعدة البيانات لأول مرة،
        // أو عند تغيير رقم الإصدار (للتحديثات المستقبلية).
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            console.log("Upgrade needed: Creating object stores...");

            // إنشاء مخزن المصروفات
            if (!db.objectStoreNames.contains(STORE_EXPENSES)) {
                // keyPath: 'id' سيُستخدم كمفتاح أساسي (Primary Key)
                // autoIncrement: true لتوليد معرف فريد تلقائيًا لكل مصروف
                db.createObjectStore(STORE_EXPENSES, { keyPath: 'id', autoIncrement: true });
            }
            
            // إنشاء مخزن الديون
            if (!db.objectStoreNames.contains(STORE_DEBTS)) {
                db.createObjectStore(STORE_DEBTS, { keyPath: 'id', autoIncrement: true });
            }

            console.log("Object stores created successfully.");
        };

        // هذا الحدث يتم تشغيله عند فتح قاعدة البيانات بنجاح
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("IndexedDB connection successful.");
            resolve(true);
        };

        // هذا الحدث يتم تشغيله في حال فشل الفتح
        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.errorCode);
            reject(new Error("Failed to open IndexedDB."));
        };
    });
}

/**
 * 2. دالة مساعدة للتعامل مع العمليات (CRUD)
 */
function operate(storeName, mode, callback) {
    if (!db) {
        throw new Error("IndexedDB is not initialized.");
    }
    // mode يمكن أن يكون 'readonly' أو 'readwrite'
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
        try {
            const result = callback(store);
            transaction.oncomplete = () => {
                resolve(result);
            };
            transaction.onerror = (event) => {
                console.error(`Transaction failed on ${storeName}:`, event.target.error);
                reject(event.target.error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 3. العمليات الخاصة بالمصروفات
 */

// إضافة مصروف جديد
function addExpense(expense) {
    // يجب أن يكون الكائن expense جاهزًا للحفظ
    // (لا يحتاج إلى id، سيتم توليده تلقائيًا)
    return operate(STORE_EXPENSES, 'readwrite', (store) => {
        // استخدام .add لإضافة كائن جديد
        return store.add(expense);
    });
}

// جلب جميع المصروفات
function getExpenses() {
    return operate(STORE_EXPENSES, 'readonly', (store) => {
        // استخدام .getAll() لجلب جميع السجلات
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
}

// جلب جميع الديون (سيتم تكرار الدوال لاحقاً للديون: addDebt, getDebts, updateDebt, deleteDebt)
function getDebts() {
     return operate(STORE_DEBTS, 'readonly', (store) => {
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
}


// تصدير الدوال الأساسية لاستخدامها في `app.js`
window.db = {
    init: initDB,
    addExpense: addExpense,
    getExpenses: getExpenses,
    getDebts: getDebts,
    // الدوال الأخرى (تحديث، حذف) ستضاف لاحقًا في المراحل 3 و 4
};

// تشغيل التهيئة عند تحميل السكربت
window.db.init()
    .then(() => console.log("IndexedDB is ready."))
    .catch((error) => console.error("FATAL: IndexedDB initialization failed.", error));

