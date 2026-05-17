const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/employees");
        
        // Wait for table to load
        await driver.sleep(5000);
        
        // Find a code from table first (DOC, REC, ADM, or EMP)
        let codeElem;
        try {
            codeElem = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'DOC') or contains(text(), 'REC') or contains(text(), 'ADM') or contains(text(), 'EMP')]")), 15000);
        } catch (e) {
            console.log("AT-151.1 Failed: Không tìm thấy mã nhân viên nào trong bảng để test tìm kiếm.");
            return;
        }
        
        let codeRaw = await codeElem.getText();
        // Regex to extract the code (e.g. "DOC0001")
        let match = codeRaw.match(/(DOC|REC|ADM|EMP)\d+/);
        if (!match) {
            console.log("AT-151.1 Failed: Không trích xuất được mã nhân viên từ text: " + codeRaw);
            return;
        }
        let code = match[0];
        console.log("Tìm kiếm với mã:", code);
        
        // Search - Use the second search input (the one in the management section)
        let searchInputs = await driver.findElements(By.xpath("//input[contains(@placeholder, 'Tìm kiếm')]"));
        let searchInput = searchInputs.length > 1 ? searchInputs[1] : searchInputs[0];
        await searchInput.clear();
        await searchInput.sendKeys(code);
        
        // Verify results (wait for filter)
        await driver.sleep(3000);
        let results = await driver.findElements(By.xpath(`//*[contains(text(), '${code}')]`));
        
        if (results.length > 0) {
            console.log("AT-151.1 Passed: Tìm kiếm nhân viên theo Mã nhân viên thành công.");
        } else {
            console.log("AT-151.1 Failed: Kết quả tìm kiếm trống sau khi nhập mã.");
        }
    } catch (err) {
        console.error("AT-151.1 Error:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
