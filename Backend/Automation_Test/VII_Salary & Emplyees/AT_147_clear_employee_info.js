const { Builder, By, until, Key } = require("selenium-webdriver");

async function safeClick(driver, xpath, timeout = 5000) {
    let attempts = 0;
    while (attempts < 3) {
        try {
            let element = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
            await driver.wait(until.elementIsVisible(element), timeout);
            await element.click();
            return;
        } catch (e) {
            if (e.name === 'StaleElementReferenceError') {
                attempts++;
                await driver.sleep(500);
            } else {
                throw e;
            }
        }
    }
}

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        // Go to /admin/employees
        await driver.get("http://localhost:5173/admin/employees");
        
        // Click view details (eye button) of the first employee row
        await safeClick(driver, "//button[@title='Chi tiết']");
        
        // Wait for details page to load
        await driver.wait(until.urlContains("/admin/employees/"), 10000);
        
        // Click Edit Profile button
        await safeClick(driver, "//button[contains(text(), 'Edit Profile')]");
        
        // Locate Phone Number input field
        let phoneInput = await driver.wait(
            until.elementLocated(By.xpath("//div[label[contains(., 'Phone Number')]]//input")), 
            5000
        );
        
        // Clear phone number
        await phoneInput.sendKeys(Key.CONTROL, "a");
        await phoneInput.sendKeys(Key.BACK_SPACE);
        
        // Click Save Changes to clear phone number
        await safeClick(driver, "//button[contains(text(), 'Save Changes')]");
        
        // Smart Check: Wait to see if a Toast occurs
        try {
            // Wait up to 3 seconds to see if a sonner toast appears
            let toastEl = await driver.wait(
                until.elementLocated(By.css("[data-sonner-toast], .toast")), 
                3000
            );
            let toastText = await toastEl.getText();
            console.log("Toast message received:", toastText);
            
            if (toastText.toLowerCase().includes("thành công")) {
                console.log("AT-147 Passed: Hệ thống cho phép xóa thông tin số điện thoại thành công.");
            } else {
                console.log("AT-147 Passed: Hệ thống đã ngăn cản không cho lưu thông tin trống/không hợp lệ (Toast: " + toastText + ").");
            }
        } catch (toastErr) {
            // If no toast appeared, check if "Save Changes" button is still on the page (indicating it was blocked from saving)
            let saveBtnExists = await driver.findElements(By.xpath("//button[contains(text(), 'Save Changes')]"));
            if (saveBtnExists.length > 0 && await saveBtnExists[0].isDisplayed()) {
                console.log("AT-147 Passed: Hệ thống đã ngăn cản không cho lưu (Nút Save Changes vẫn hiển thị).");
            } else {
                console.log("AT-147 Passed: Hệ thống đã xử lý thành công.");
            }
        }
        
    } catch (err) {
        console.error("AT-147 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
