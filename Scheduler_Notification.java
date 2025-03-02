import java.awt.*;

public class NotificationExample {
    public static void main(String[] args) {
        // Check if System Tray is supported
        if (!SystemTray.isSupported()) {
            System.out.println("System tray not supported!");
            return;
        }

        // Get the system tray instance
        SystemTray tray = SystemTray.getSystemTray();
        
        // Create an image for the tray icon
        Image image = Toolkit.getDefaultToolkit().createImage("icon.png"); // Replace with an actual icon path

        // Create the tray icon
        TrayIcon trayIcon = new TrayIcon(image, "Notification Example");
        trayIcon.setImageAutoSize(true);
        trayIcon.setToolTip("Java Notification System");

        try {
            tray.add(trayIcon); // Add the tray icon
            trayIcon.displayMessage("Reminder", "This is your scheduled notification!", TrayIcon.MessageType.INFO);
        } catch (AWTException e) {
            e.printStackTrace();
        }
    }
}