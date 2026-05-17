const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/doctor"), 10000);

        // Navigate to Doctor Medical List
        await driver.get("http://localhost:5173/doctor/medicalList");
        await driver.sleep(2000);

        // Find the patient row with status 'Đã check-in'
        let checkedInRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Đã check-in')]")), 10000);
        let startBtn = await checkedInRow.findElement(By.xpath(".//button[contains(., 'Khám bệnh')]"));
        console.log("Found patient row with status 'Đã check-in'. Clicking 'Khám bệnh' button...");
        await driver.executeScript("arguments[0].click();", startBtn);
        
        // Wait for Consultation page /doctor/patients/:id to load
        await driver.wait(until.urlContains("/doctor/patients/"), 10000);
        console.log("Consultation page loaded.");

        // Wait for FormMedicalPage input elements
        let diagInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Nhập chẩn đoán bệnh...']")), 10000);
        
        // Clear existing diagnosis value if any
        await driver.executeScript("arguments[0].value = '';", diagInput);
        
        // Input short diagnosis under 10 characters (e.g. 'Ho sốt' - 6 characters)
        await diagInput.sendKeys("Ho sốt");
        await driver.sleep(1000);

        // Click 'Lưu & Kê đơn' button to submit
        let saveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Lưu & Kê đơn')]")), 5000);
        await driver.executeScript("arguments[0].click();", saveBtn);

        // Wait for validation error toast from backend/frontend (must contain "10")
        const toast = await driver.wait(until.elementLocated(By.xpath("//li[@data-sonner-toast]//*[contains(text(), '10') or contains(text(), 'characters') or contains(text(), 'chữ')]")), 10000);
        const errorText = await toast.getText();

        console.log(`AT-105 Passed: Blocked prescribing/completing visit when diagnosis is under 10 characters. Toast error: "${errorText}"`);
    } catch (err) { 
        console.error("AT-105 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
