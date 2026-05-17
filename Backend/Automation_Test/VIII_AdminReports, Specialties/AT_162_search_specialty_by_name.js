const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 5000);
        await driver.get("http://localhost:5173/admin/specialties");
        
        // Wait for table to load
        await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr")), 10000);
        
        // Get name of the first specialty to search for it
        const firstSpecialtyName = await driver.findElement(By.xpath("//table//tbody//tr[1]//td[2]//div")).getText();
        
        // Use search
        const searchInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Tìm kiếm chuyên khoa (Tên, Mô tả)...']")), 5000);
        await searchInput.sendKeys(firstSpecialtyName);
        await driver.sleep(1000); // Wait for debounce and search
        
        // Verify results
        const rows = await driver.findElements(By.xpath("//table//tbody//tr"));
        let found = false;
        for (let row of rows) {
            const name = await row.findElement(By.xpath(".//td[2]//div")).getText();
            if (name.includes(firstSpecialtyName)) {
                found = true;
            }
        }
        
        if (found) {
            console.log("AT-162 Passed: Search specialty by name success");
        } else {
            throw new Error("Search result did not match");
        }
    } catch (err) { 
        console.error("AT-162 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
