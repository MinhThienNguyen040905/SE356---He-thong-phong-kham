const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/inventory");
        let editBtn = await driver.wait(until.elementLocated(By.xpath("//a[contains(@href, '/edit')]")), 10000);
        await editBtn.click();
        
        // Wait for edit page and specifically wait for name field to indicate form is fully loaded
        await driver.wait(until.elementLocated(By.id("name")), 10000);
        await driver.sleep(1000);

        // Clear the unit field programmatically using the exposed hook setFormValue
        await driver.executeScript("window.setFormValue('unit', '');");
        await driver.sleep(1000);

        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Cập nhật')] | //button[contains(., 'Lưu')]"));
        await driver.executeScript("arguments[0].click();", submitBtn);
        
        let errorMsg = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Đơn vị bắt buộc nhập')]")), 5000);
        const errorText = await errorMsg.getText();
        console.log(`AT-128 Passed: Cập nhật thất bại khi để trống đơn vị. Error: "${errorText}"`);
    } catch (err) {
        console.error("AT-128 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
