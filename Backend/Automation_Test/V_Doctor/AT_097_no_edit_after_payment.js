const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/doctor"), 10000);
        
        await driver.get("http://localhost:5173/doctor/medicalList");
        
        // Find a COMPLETED and PAID appointment
        let completedRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Đã khám') and contains(., 'Đã thanh toán')]")), 10000);
        await completedRow.findElement(By.xpath(".//button")).click();
        
        // Try to edit prescription
        let editBtn = await driver.findElements(By.xpath("//button[contains(., 'Sửa đơn thuốc')]"));
        if (editBtn.length === 0 || !(await editBtn[0].isEnabled())) {
            console.log("AT-97 Passed: Không sửa được đơn thuốc sau khi đã thanh toán - Ràng buộc dữ liệu tốt.");
        } else {
            throw new Error("Vẫn có thể sửa đơn thuốc sau khi thanh toán!");
        }
    } catch (err) {
        console.error("AT-97 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
