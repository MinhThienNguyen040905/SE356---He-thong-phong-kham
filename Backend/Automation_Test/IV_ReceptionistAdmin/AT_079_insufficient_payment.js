const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("reception@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/receptionist"), 5000);
        
        await driver.get("http://localhost:5173/invoices");
        
        // Find all rows in the invoice table
        let rows = await driver.wait(until.elementsLocated(By.xpath("//tbody/tr")), 15000);
        let selectedRow = null;
        for (let row of rows) {
            let text = await row.getText();
            if (text.includes("Chờ thanh toán")) {
                let cells = await row.findElements(By.tagName("td"));
                if (cells.length >= 5) {
                    let amountText = await cells[4].getText(); // 5th column is index 4
                    let cleanAmount = amountText.replace(/[^0-9]/g, '');
                    let amount = parseInt(cleanAmount) || 0;
                    if (amount > 0) {
                        selectedRow = row;
                        break;
                    }
                }
            }
        }
        
        if (!selectedRow) {
            throw new Error("Không tìm thấy hóa đơn nào chưa thanh toán và có tổng tiền > 0!");
        }
        
        let viewBtn = await selectedRow.findElement(By.xpath(".//a[contains(@href, '/invoices/')]"));
        await viewBtn.click();
        
        // Click Add Payment
        let addPaymentBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thêm thanh toán')]")), 10000);
        await addPaymentBtn.click();
        
        // Fill an insufficient amount (10,000 VND is definitely less than total invoice amount)
        let amountInput = await driver.wait(until.elementLocated(By.id("paymentAmount")), 5000);
        await amountInput.clear();
        await amountInput.sendKeys("10000");
        
        // Click Xác nhận thanh toán
        let confirmBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Xác nhận thanh toán')]")), 5000);
        await driver.sleep(1000); // Wait for React state to sync
        await confirmBtn.click();
        
        // Wait for success toast
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        
        // Wait for status badge to update to "Thanh toán một phần"
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Thanh toán một phần')]")), 10000);
        
        console.log("AT-079 Passed: Thanh toán không đủ tiền (Thanh toán một phần) thành công.");
    } catch (err) { 
        console.error("AT-079 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
