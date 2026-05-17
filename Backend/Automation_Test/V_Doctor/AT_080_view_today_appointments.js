const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/doctor"), 5000);
        await driver.get("http://localhost:5173/doctor/medicalList");
        
        try {
            // Wait for page title
            await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Medical Appointments')]")), 10000);
        } catch (e) {
            let pageText = await driver.findElement(By.tagName("body")).getText();
            console.log("Page Content on failure:", pageText);
            throw e;
        }
        
        await driver.wait(until.elementLocated(By.xpath("//table | //*[contains(text(), 'No appointments found')]")), 10000);
        console.log("AT-080 Passed: Bác sĩ xem danh sách lịch khám hôm nay thành công.");
    } catch (err) {
        console.error("AT-080 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
