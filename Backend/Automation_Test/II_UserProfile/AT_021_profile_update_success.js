const { Builder, By, until, Key } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/patient/profile");

        let fullName = await driver.wait(until.elementLocated(By.id("fullName")), 5000);
        await driver.sleep(1000); // Wait for API data to fill
        await fullName.sendKeys(Key.CONTROL, "a");
        await fullName.sendKeys(Key.BACK_SPACE);
        await fullName.sendKeys("Patient Update Test");

        let phone = await driver.findElement(By.id("phone"));
        await phone.sendKeys(Key.CONTROL, "a");
        await phone.sendKeys(Key.BACK_SPACE);
        await phone.sendKeys("0901234567");

        let address = await driver.findElement(By.id("address"));
        await address.sendKeys(Key.CONTROL, "a");
        await address.sendKeys(Key.BACK_SPACE);
        await address.sendKeys("123 Hanoi, Vietnam");

        await driver.findElement(By.xpath("//button[contains(text(), 'Lưu thay đổi')]")).click();
        
        try {
            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 5000);
            console.log("AT-019 Passed");
        } catch (e) {
            let errorToast = await driver.findElement(By.css("[data-sonner-toast]")).getText();
            console.log("AT-019 Error Toast Text:", errorToast);
            throw e;
        }
    } catch (err) { 
        console.error("AT-019 Failed", err.message); 
        await driver.takeScreenshot().then(function(image) {
            require('fs').writeFileSync('error_screenshot.png', image, 'base64');
        });
    } finally { 
        await driver.quit(); 
    }
}
run();
