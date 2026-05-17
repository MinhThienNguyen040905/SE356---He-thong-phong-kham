const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 5000);
        await driver.get("http://localhost:5173/admin/shifts");
        
        await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr")), 10000);
        
        const firstShiftName = await driver.findElement(By.xpath("//table//tbody//tr[1]//td[2]//div")).getText();
        
        const searchInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Tìm kiếm theo tên...']")), 5000);
        await searchInput.sendKeys(firstShiftName);
        await driver.sleep(1000);
        
        const rows = await driver.findElements(By.xpath("//table//tbody//tr"));
        let found = false;
        for (let row of rows) {
            const name = await row.findElement(By.xpath(".//td[2]//div")).getText();
            if (name.includes(firstShiftName)) {
                found = true;
            }
        }
        
        if (found) {
            console.log("AT-176 Passed: Search shift by name success");
        } else {
            throw new Error("Search result did not match");
        }
    } catch (err) { 
        console.error("AT-176 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
