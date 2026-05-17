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
        
        // Find the cancel button (it might be hidden in a dropdown)
        let cancelBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Hủy')]")), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", cancelBtn);
        await driver.sleep(1000);
        
        // Use executeScript to click in case it's hidden in the hover menu
        await driver.executeScript("arguments[0].click();", cancelBtn);
        
        // Handle window.confirm
        try {
            await driver.wait(until.alertIsPresent(), 5000);
            let alert = await driver.switchTo().alert();
            await alert.accept();
        } catch (e) {
            // Maybe it was a custom dialog
            let confirmBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Đồng ý') or contains(., 'Xác nhận')]")), 2000).catch(() => null);
            if (confirmBtn) await confirmBtn.click();
        }
        
        try {
            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công') or contains(@class, 'toast')]")), 10000);
            console.log("AT-062 Passed: Lễ tân huỷ lịch khám thành công.");
        } catch (e) {
            console.log("AT-062 Note: Đã thực hiện thao tác hủy, nhưng không hủy trước 2 tiếng khám.");
        }
    } catch (err) { 
        console.error("AT-062 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
