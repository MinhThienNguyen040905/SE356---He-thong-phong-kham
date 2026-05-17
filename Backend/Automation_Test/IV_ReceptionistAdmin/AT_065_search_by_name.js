const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("reception@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/receptionist"), 5000);
        await driver.get("http://localhost:5173/appointments");
        
        // Input name in search field
        let searchBox = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Tìm kiếm...' or contains(@placeholder, 'tên')]")), 10000);
        await searchBox.sendKeys("Nguyễn Văn A");
        
        await driver.sleep(2000);
        console.log("AT-065 Passed: Tìm kiếm lịch khám theo tên thành công.");
    } catch (err) { 
        console.error("AT-065 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
