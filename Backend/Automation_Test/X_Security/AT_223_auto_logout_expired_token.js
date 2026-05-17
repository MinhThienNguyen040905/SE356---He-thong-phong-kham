const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);

        // Corrupt tokens to simulate expired/invalid token session
        await driver.executeScript(() => {
            localStorage.setItem("accessToken", "expired-invalid-token-xyz");
            localStorage.removeItem("refreshToken");
        });

        // Trigger an API request by navigating to /admin/employees
        await driver.get("http://localhost:5173/admin/employees");
        
        // The interceptor should catch 401/error, call clearAccessToken, and redirect to /login
        await driver.wait(until.urlContains("/login"), 10000);

        console.log("AT-223 Passed: Auto logged out when token is expired/invalid.");
    } catch (err) { 
        console.error("AT-223 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
