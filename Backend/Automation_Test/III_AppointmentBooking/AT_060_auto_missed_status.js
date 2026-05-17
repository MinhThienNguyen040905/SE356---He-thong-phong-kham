const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/admin"), 10000);
        
        // This test assumes checking a system logic or background task
        // We'll simulate by checking an appointment that is past its time
        await driver.get("http://localhost:5173/admin/appointments");
        
        let missedStatus = await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Bỏ lỡ') or contains(text(), 'Missed')]")), 10000);
        console.log("AT-060 Passed: Trạng thái 'Bỏ lỡ' hiển thị cho lịch hẹn quá hạn.");
    } catch (err) { 
        console.error("AT-060 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
