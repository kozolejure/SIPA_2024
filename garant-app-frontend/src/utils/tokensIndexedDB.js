// src/utils/tokensIndexedDB.js
const DB_NAME = 'authDatabase';
const DB_VERSION = 1;
const TOKEN_STORE = 'tokens';

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onerror = (event) => {
    console.error('Database error:', event.target.errorCode);
};

request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore(TOKEN_STORE, { keyPath: 'id' });
};

const dbOperation = (type, data) => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction([TOKEN_STORE], 'readwrite');
            const objectStore = transaction.objectStore(TOKEN_STORE);

            let actionRequest;
            if (type === 'put') {
                actionRequest = objectStore.put({ id: 'authTokens', ...data });
            } else if (type === 'get') {
                actionRequest = objectStore.get('authTokens');
            } else if (type === 'delete') {
                actionRequest = objectStore.delete('authTokens');
            }

            actionRequest.onsuccess = () => {
                resolve(actionRequest.result);
            };

            actionRequest.onerror = (event) => {
                reject(event.target.error);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        };
    });
};

export const saveTokens = (jwtToken, refreshToken) => {
    return dbOperation('put', { jwtToken, refreshToken });
};

export const getTokens = () => {
    return dbOperation('get');
};

export const deleteTokens = () => {
    return dbOperation('delete');
};
