// src/hooks/useNotification.js
import { useCallback } from 'react';
import { NotificationManager } from 'react-notifications';

const useNotification = () => {
    const notify = useCallback((type, message, title = '', duration = 3000, callback = null) => {
        switch (type) {
            case 'info':
                NotificationManager.info(message, title, duration);
                break;
            case 'success':
                NotificationManager.success(message, title, duration);
                break;
            case 'warning':
                NotificationManager.warning(message, title, duration);
                break;
            case 'error':
                NotificationManager.error(message, title, duration, callback);
                break;
            default:
                NotificationManager.info(message, title, duration);
        }
    }, []);

    return notify;
};

export default useNotification;
