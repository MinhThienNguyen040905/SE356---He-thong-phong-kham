const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 5000);
        await driver.get("http://localhost:5173/admin/shifts");
        
        await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr[1]")), 10000);
        
        const searchInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Tìm kiếm theo tên...']")), 5000);
        await searchInput.sendKeys("Ca Test 01");
        await driver.sleep(1000);
        
        const editBtn = await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr[1]//button[@title='Chỉnh sửa']")), 5000);
        await driver.executeScript("arguments[0].click();", editBtn);
        
        const editNameInput = await driver.wait(until.elementLocated(By.id("edit-name")), 5000);
        
        // Use a combination of select all and delete to clear the input reliably
        await driver.executeScript("arguments[0].value = '';", editNameInput);
        await editNameInput.sendKeys(" "); // just to trigger change event
        await editNameInput.sendKeys(require('selenium-webdriver').Key.BACK_SPACE);
        
        const saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu thay đổi')]"));
        await driver.executeScript("arguments[0].click();", saveBtn);
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Vui lòng nhập tên ca trực')]")), 5000);
        console.log("AT-172 Passed: Edit shift fail empty name");
    } catch (err) { 
        console.error("AT-172 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
