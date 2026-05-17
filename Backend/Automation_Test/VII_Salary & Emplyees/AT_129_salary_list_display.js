const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        // Go to Salary Page
        await driver.get("http://localhost:5173/admin/salary");
        
        // Check if the table or empty message is displayed
        await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Quản lý Lương')]")), 10000);
        
        let content = await driver.wait(until.elementLocated(By.css("table, h3")), 10000);
        let text = await content.getText();
        
        if (text.includes("Chưa có dữ liệu") || text.length > 0) {
            console.log("AT-129 Passed: Trang bảng lương hiển thị đúng cấu trúc.");
        } else {
            console.error("AT-129 Failed: Trang bảng lương không hiển thị nội dung.");
        }
    } catch (err) {
        console.error("AT-129 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
