export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const showDesktopNotification = (title, options = {}) => {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    // Show native desktop notification
    const notification = new Notification(title, {
      icon: "/favicon.ico", // Add your app icon path here
      ...options,
    });

    notification.onclick = function () {
      window.focus();
      notification.close();
    };
  }
};