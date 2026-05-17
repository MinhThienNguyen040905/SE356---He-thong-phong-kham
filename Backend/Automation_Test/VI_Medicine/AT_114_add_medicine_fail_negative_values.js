const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/medicines/create");
        
        let importPrice = await driver.wait(until.elementLocated(By.id("importPrice")), 5000);
        await importPrice.sendKeys("-100");
        
        // Check HTML5 validation state via Javascript
        let isValid = await driver.executeScript("return arguments[0].validity.valid;", importPrice);
        let validationMessage = await driver.executeScript("return arguments[0].validationMessage;", importPrice);
        
        if (!isValid) {
            console.log("AT-119 Passed: Trình duyệt chặn giá trị âm. Thông báo: " + validationMessage);
        } else {
            // If browser doesn't block, try to click submit and check Yup
            await driver.findElement(By.xpath("//button[contains(., 'Tạo thuốc')]")).click();
            let errorMsg = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), '>= 0')]")), 5000);
            console.log("AT-119 Passed: Hệ thống báo lỗi Yup khi nhập giá trị âm.");
        }
    } catch (err) {
        console.error("AT-119 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
