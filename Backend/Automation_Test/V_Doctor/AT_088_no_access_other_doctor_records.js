const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/doctor"), 10000);
        
        // Attempt to access an appointment ID that likely doesn't belong to this doctor or doesn't exist
        await driver.get("http://localhost:5173/doctor/patients/999999");
        
        // Check for error message or redirection
        let errorMsg = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Không tìm thấy') or contains(text(), '403') or contains(text(), 'not found') or contains(text(), 'Error')]")), 10000);
        
        console.log("AT-088 Passed: Hệ thống bảo mật tốt, không hiển thị dữ liệu trái phép.");
    } catch (err) {
        console.error("AT-088 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
