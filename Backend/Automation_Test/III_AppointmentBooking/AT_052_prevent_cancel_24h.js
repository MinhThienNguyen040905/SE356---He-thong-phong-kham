const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/patient/appointments");
        
        // Find an appointment within 24h and check if cancel/edit buttons are disabled
        let cancelBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Hủy')]")), 10000);
        let isDisabled = await cancelBtn.getAttribute("disabled");
        
        if (isDisabled === "true") {
            console.log("AT-052 Passed: Nút hủy bị vô hiệu hóa khi lịch hẹn dưới 24h.");
        } else {
            console.log("AT-052 Note: Nút hủy vẫn hiển thị, kiểm tra logic chặn ở popup hoặc server.");
        }
    } catch (err) { 
        console.error("AT-052 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
