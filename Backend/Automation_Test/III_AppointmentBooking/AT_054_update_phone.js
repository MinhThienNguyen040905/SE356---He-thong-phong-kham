const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/patient/profile");
        
        let phoneInput = await driver.wait(until.elementLocated(By.id("phone")), 5000);
        await phoneInput.clear();
        await phoneInput.sendKeys("0243123456"); // Example landline
        await driver.findElement(By.xpath("//button[contains(., 'Cập nhật')]")).click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 5000);
        console.log("AT-054 Passed: Cập nhật SĐT thành số điện thoại bàn hợp lệ thành công.");
    } catch (err) { 
        console.error("AT-054 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
