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
        
        // Find an appointment with status 'Đã check-in' (CHECKED_IN)
        let checkedInRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Đã check-in')]")), 10000);
        let startBtn = await checkedInRow.findElement(By.xpath(".//button[contains(., 'Khám bệnh')]"));
        await startBtn.click();
        
        // Check if navigated to consultation page
        await driver.wait(until.urlContains("/doctor/patients/"), 10000);
        console.log("AT-081 Passed: Cập nhật trạng thái sang Đang khám (vào trang khám) thành công.");
    } catch (err) {
        console.error("AT-081 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
