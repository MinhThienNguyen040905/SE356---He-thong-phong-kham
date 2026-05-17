const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("NewPass123!"); // Cần cập nhật mật khẩu hiện tại nếu AT-022 đã chạy
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/patient/profile");

        await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Đổi mật khẩu')]")), 5000).click();

        await driver.wait(until.elementLocated(By.id("currentPassword")), 5000).sendKeys("WrongPass123");
        await driver.findElement(By.id("newPassword")).sendKeys("NewPass123!");
        await driver.findElement(By.id("confirmPassword")).sendKeys("NewPass123!");

        await driver.findElement(By.xpath("//div[contains(@class, 'flex justify-end')]//button[contains(text(), 'Đổi mật khẩu')]")).click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'không đúng') or contains(text(), 'lỗi')]")), 5000);
        console.log("AT-023 Passed");
    } catch (err) { console.error("AT-023 Failed", err); } finally { await driver.quit(); }
}
run();
