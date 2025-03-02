import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class TaskScheduler {
    public static void main(String[] args) {
        // Create a scheduled executor service with a single thread
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

        // Define the task to be executed
        Runnable task = () -> System.out.println("Task executed at: " + System.currentTimeMillis());

        // Schedule the task to run every 5 seconds with an initial delay of 2 seconds
        scheduler.scheduleAtFixedRate(task, 2, 5, TimeUnit.SECONDS);

        // Optionally, shut down the scheduler after some time
        // scheduler.shutdown(); // Uncomment if you want to stop execution after a certain period
    }
}
