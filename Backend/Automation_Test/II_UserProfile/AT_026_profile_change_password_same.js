const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("NewPass123!"); 
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/patient/profile");

        await driver.wait(until.elementLocated(By.id("currentPassword")), 5000).sendKeys("123456");
        // Nhập mật khẩu mới giống hệt mật khẩu cũ, nhưng là password vi phạm điều kiện độ khó của schema
        await driver.findElement(By.id("newPassword")).sendKeys("123456");
        await driver.findElement(By.id("confirmPassword")).sendKeys("123456");

        await driver.findElement(By.xpath("//div[contains(@class, 'flex justify-end')]//button[contains(text(), 'Đổi mật khẩu')]")).click();
        
        // Yup schema sẽ chặn lại
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'ít nhất 6 ký tự') or contains(text(), 'khác với mật khẩu hiện tại')]")), 5000);
        console.log("AT-024 Passed");
    } catch (err) { console.error("AT-024 Failed", err); } finally { await driver.quit(); }
}
run();
