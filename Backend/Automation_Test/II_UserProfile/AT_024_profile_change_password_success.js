const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        // LƯU Ý: Nếu đã test thành công ở lần trước, mật khẩu cũ có thể đã bị đổi thành NewPass123!
        await driver.findElement(By.id("password")).sendKeys("NewPass123!");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/patient/profile");
        await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Đổi mật khẩu')]")), 5000).click();

        await driver.wait(until.elementLocated(By.id("currentPassword")), 5000).sendKeys("NewPass123!");
        await driver.findElement(By.id("newPassword")).sendKeys("Mi123456");
        await driver.findElement(By.id("confirmPassword")).sendKeys("Mi123456");

        await driver.findElement(By.xpath("//div[contains(@class, 'flex justify-end')]//button[contains(text(), 'Đổi mật khẩu')]")).click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 5000);
        console.log("AT-022 Passed");
    } catch (err) { 
        console.error("AT-022 Failed", err.message); 
        await driver.takeScreenshot().then(function(image) {
            require('fs').writeFileSync('error_screenshot_at022.png', image, 'base64');
        });
    } finally { 
        await driver.quit(); 
    }
}
run();
