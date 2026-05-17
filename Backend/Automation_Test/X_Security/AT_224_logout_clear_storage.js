const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);

        // Open account menu dropdown
        const avatarBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'flex items-center gap-2')]")), 5000);
        await avatarBtn.click();
        await driver.sleep(500);

        // Click "Đăng xuất" option in dropdown
        const logoutOption = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Đăng xuất')]")), 5000);
        await logoutOption.click();
        await driver.sleep(500);

        // Click confirmation button in AlertDialog
        const confirmBtn = await driver.wait(until.elementLocated(By.xpath("//div[@role='alertdialog']//button[contains(text(), 'Đăng xuất')]")), 5000);
        await confirmBtn.click();

        // Wait for redirect to login page
        await driver.wait(until.urlContains("/login"), 10000);
        await driver.sleep(1000);

        // Verify localStorage tokens are cleared
        const accessToken = await driver.executeScript(() => localStorage.getItem("accessToken"));
        const refreshToken = await driver.executeScript(() => localStorage.getItem("refreshToken"));

        if (accessToken || refreshToken) {
            throw new Error(`Tokens not cleared from localStorage! accessToken: ${accessToken}, refreshToken: ${refreshToken}`);
        }

        console.log("AT-224 Passed: Logged out and cleared localStorage successfully.");
    } catch (err) { 
        console.error("AT-224 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
