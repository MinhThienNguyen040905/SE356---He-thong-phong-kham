const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);

        // Attempt to access Doctor page
        await driver.get("http://localhost:5173/doctor/dashboard");
        
        // Verify it redirects to login or unauthorized, or doesn't stay on /doctor
        await driver.wait(async () => {
            const url = await driver.getCurrentUrl();
            return !url.includes("/doctor/dashboard") || url.includes("/unauthorized") || url.includes("/login");
        }, 5000);

        console.log("AT-220 Passed: Patient cannot access /doctor.");
    } catch (err) { 
        console.error("AT-220 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
