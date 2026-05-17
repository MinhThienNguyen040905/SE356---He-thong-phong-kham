const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("reception@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/receptionist"), 5000);
        
        await driver.get("http://localhost:5173/receptionist/patients/new");
        await driver.findElement(By.id("name")).sendKeys("Bệnh nhân tạm 1");
        await driver.findElement(By.id("phone")).sendKeys("0123456789");
        await driver.findElement(By.xpath("//button[contains(., 'Tạo tài khoản tạm')]")).click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 5000);
        console.log("AT-068 Passed: Tạo tài khoản tạm thành công.");
    } catch (err) { 
        console.error("AT-068 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
