const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/privacy-policy");
        
        await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Chính sách bảo mật') or contains(text(), 'Điều khoản')]")), 10000);
        console.log("AT-056 Passed: Xem điều khoản sử dụng và chính sách bảo mật thành công.");
    } catch (err) { 
        console.error("AT-056 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
