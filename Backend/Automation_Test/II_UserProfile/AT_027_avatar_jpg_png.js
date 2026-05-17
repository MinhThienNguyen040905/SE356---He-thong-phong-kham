const { Builder, By, until } = require("selenium-webdriver");
const path = require("path");
const fs = require("fs");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        // Ensure dummy JPG exists
        const avatarPath = path.resolve(__dirname, "dummy_avatar.jpg");
        if (!fs.existsSync(avatarPath)) {
            fs.writeFileSync(avatarPath, Buffer.alloc(100)); // small dummy file
        }

        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);

        // Navigate to Patient Profile
        await driver.get("http://localhost:5173/patient/profile");
        
        // Find avatar file input (hidden input inside the label/button)
        const fileInput = await driver.wait(until.elementLocated(By.xpath("//input[@type='file']")), 5000);
        await fileInput.sendKeys(avatarPath);
        await driver.sleep(1000);

        // Click Save Profile
        const saveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Lưu thay đổi')]")), 5000);
        await driver.executeScript("arguments[0].click();", saveBtn);

        // Wait for success toast containing 'Cập nhật avatar thành công' or 'Cập nhật thông tin thành công'
        const toast = await driver.wait(until.elementLocated(By.xpath("//li[@data-sonner-toast]//*[contains(text(), 'thành công')]")), 10000);
        const text = await toast.getText();

        console.log(`AT-027 Passed: Uploaded avatar JPG/PNG < 5MB successfully. Toast message: "${text}"`);
    } catch (err) { 
        console.error("AT-027 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
