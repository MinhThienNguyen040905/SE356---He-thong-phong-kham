const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/contact");
        
        await driver.findElement(By.id("subject")).sendKeys("Hỏi về bảo hiểm");
        await driver.findElement(By.id("message")).sendKeys("Tôi muốn hỏi về chính sách bảo hiểm y tế.");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 5000);
        console.log("AT-055 Passed: Gửi form liên hệ thành công.");
    } catch (err) { 
        console.error("AT-055 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
