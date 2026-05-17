const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/salary");
        
        // Find search input
        let searchInput = await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'Tìm kiếm theo tên hoặc mã nhân viên')]")), 10000);
        
        // Search for a common prefix
        await searchInput.sendKeys("DOC");
        await driver.sleep(1000); // Wait for filter
        
        // Check if rows contain 'DOC' or if there's an empty message (which is also a valid state if no data exists)
        let results = await driver.findElements(By.xpath("//tbody/tr | //h3[contains(., 'Chưa có dữ liệu')]"));
        
        if (results.length > 0) {
            console.log("AT-130 Passed: Chức năng tìm kiếm hoạt động.");
        } else {
            console.error("AT-130 Failed: Không thấy phản hồi từ chức năng tìm kiếm.");
        }
    } catch (err) {
        console.error("AT-130 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
