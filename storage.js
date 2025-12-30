// storage.js
// تطبيق منطق IndexedDB لإدارة البيانات المحلية

const DB_NAME = 'SmartBudgetDB';
const DB_VERSION = 1;
const STORE_EXPENSES = 'expenses'; // مخزن المصروفات
const STORE_DEBTS = 'debts';       // مخزن الديون

let db; // متغير لحفظ اتصال قاعدة البيانات

/**
 * 1. تهيئة وفتح قاعدة بيانات IndexedDB
 */
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // هذا الحدث يتم تشغيله عند تغيير رقم الإصدار (أو أول فتح)
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            console.log("Upgrade needed: Creating object stores...");

            // إنشاء مخزن المصروفات
            if (!db.objectStoreNames.contains(STORE_EXPENSES)) {
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
 * 2. دالة مساعدة للتعامل مع العمليات (CRUD) - تم التصحيح لضمان نجاح الحفظ
 */
function operate(storeName, mode, callback) {
    if (!db) {
        return Promise.reject(new Error("IndexedDB is not initialized."));
    }

    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
        try {
            // callback تُرجع IndexedDB Request (مثل store.add() أو store.getAll())
            const request = callback(store); 
            
            request.onsuccess = () => {
                // نستخدم request.result كقيمة resolution
                resolve(request.result); 
            };
            
            request.onerror = (event) => {
                console.error(`Request failed on ${storeName}:`, event.target.error);
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
function addExpense(expense) {
    return operate(STORE_EXPENSES, 'readwrite', (store) => {
        return store.add(expense); 
    });
}

function getExpenses() {
    return operate(STORE_EXPENSES, 'readonly', (store) => {
        return store.getAll();
    });
}

/**
 * 4. العمليات الخاصة بالديون (لك وعليك)
 */
function addDebt(debt) {
    return operate(STORE_DEBTS, 'readwrite', (store) => {
        return store.add(debt); 
    });
}

function getDebts() {
     return operate(STORE_DEBTS, 'readonly', (store) => {
        return store.getAll();
    });
}

function updateDebt(debt) {
    return operate(STORE_DEBTS, 'readwrite', (store) => {
        return store.put(debt); 
    });
}

function deleteDebt(id) {
    return operate(STORE_DEBTS, 'readwrite', (store) => {
        return store.delete(parseInt(id)); 
    });
}


// تصدير الدوال الأساسية لاستخدامها في `app.js`
window.db = {
    init: initDB,
    addExpense: addExpense,
    getExpenses: getExpenses,
    getDebts: getDebts, 
    addDebt: addDebt,
    updateDebt: updateDebt,
    deleteDebt: deleteDebt,
};

// تشغيل التهيئة عند تحميل السكربت
window.db.init()
    .then(() => console.log("IndexedDB is ready."))
    .catch((error) => console.error("FATAL: IndexedDB initialization failed.", error));
