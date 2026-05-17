const { Builder, By, until } = require("selenium-webdriver");
const path = require("path");
const fs = require("fs");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        // Ensure dummy PDF exists
        const pdfPath = path.resolve(__dirname, "dummy_document.pdf");
        if (!fs.existsSync(pdfPath)) {
            fs.writeFileSync(pdfPath, "dummy PDF content");
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
        await fileInput.sendKeys(pdfPath);

        // Wait for error toast containing 'Chỉ chấp nhận file ảnh'
        const toast = await driver.wait(until.elementLocated(By.xpath("//li[@data-sonner-toast]//*[contains(text(), 'Chỉ chấp nhận file ảnh')]")), 5000);
        const text = await toast.getText();

        console.log(`AT-028 Passed: PDF upload blocked successfully. Toast message: "${text}"`);
    } catch (err) { 
        console.error("AT-028 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
