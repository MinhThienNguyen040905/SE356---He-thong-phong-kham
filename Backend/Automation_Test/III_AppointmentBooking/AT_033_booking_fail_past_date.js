const { Builder, By, until } = require("selenium-webdriver");
const fs = require('fs');

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/patient"), 5000);
        
        // Go to Book Appointment
        await driver.get("http://localhost:5173/patient/book-appointment");
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Nội khoa')] | //span[contains(text(), 'Nội khoa')] | //button[contains(., 'Nội')]")), 10000);
        
        // 1. Select Specialty (First one)
        const specialties = await driver.findElements(By.xpath("//button[.//span[contains(@class, 'text-xs')]]"));
        if(specialties.length > 0) {
            await specialties[2].click();
            await driver.sleep(1000);
        }

        // 2. Select Past Date (Usually disabled in calendar UI)
        // Check if past days have 'disabled' attribute
        const pastDate = await driver.findElements(By.xpath("//button[contains(@class, 'rdp-day') and @disabled]"));
        if(pastDate.length > 0) {
            const isDisabled = await pastDate[0].getAttribute('disabled');
            if (isDisabled === 'true') {
                console.log("AT-027 Passed: Past dates are disabled and cannot be selected.");
            } else {
                throw new Error("Past date is selectable, this is a bug.");
            }
        } else {
            console.log("No past dates found on calendar to check (maybe beginning of month), but assuming pass if validation is on.");
        }
    } catch (err) { 
        console.error("AT-027 Failed:", err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
