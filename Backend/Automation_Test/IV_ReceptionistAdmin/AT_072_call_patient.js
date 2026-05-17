const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("reception@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/receptionist"), 5000);
        
        await driver.get("http://localhost:5173/receptionist/queue");
        let callBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Gọi tên')]")), 10000);
        await callBtn.click();
        
        await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Đang khám')]")), 5000);
        console.log("AT-072 Passed: Gọi tên bệnh nhân chuyển sang 'Đang khám' thành công.");
    } catch (err) { 
        console.error("AT-072 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
