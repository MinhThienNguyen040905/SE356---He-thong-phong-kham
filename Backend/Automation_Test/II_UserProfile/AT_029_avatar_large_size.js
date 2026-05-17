const { Builder, By, until } = require("selenium-webdriver");
const path = require("path");
const fs = require("fs");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        // Create an 11MB file to simulate file size exceeding limit (10MB in codebase)
        const largeFilePath = path.resolve(__dirname, "dummy_large.jpg");
        if (!fs.existsSync(largeFilePath)) {
            const buffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
            fs.writeFileSync(largeFilePath, buffer);
        }

        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);

        // Navigate to Patient Profile
        await driver.get("http://localhost:5173/patient/profile");
        
        // Find avatar file input
        const fileInput = await driver.wait(until.elementLocated(By.xpath("//input[@type='file']")), 5000);
        await fileInput.sendKeys(largeFilePath);

        // Wait for error toast containing 'Kích thước file không được vượt quá'
        const toast = await driver.wait(until.elementLocated(By.xpath("//li[@data-sonner-toast]//*[contains(text(), 'vượt quá 10MB')]")), 5000);
        const text = await toast.getText();

        console.log(`AT-029 Passed: Large file upload blocked successfully. Toast message: "${text}"`);
    } catch (err) { 
        console.error("AT-029 Failed:", err.message || err); 
    } finally { 
        // Cleanup the large 11MB file to save disk space
        const largeFilePath = path.resolve(__dirname, "dummy_large.jpg");
        if (fs.existsSync(largeFilePath)) {
            fs.unlinkSync(largeFilePath);
        }
        await driver.quit(); 
    }
}
run();
