import { test, expect } from '@playwright/test';

test('Flujo completo: Login -> Editor -> Combate', async ({ page }) => {
    test.slow();

    await page.route('**/health', route => route.fulfill({ status: 200 }));
    await page.route('**/auth/login', route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
            token: 'fake-token',
            user: { id: 1, email: 'test@example.com', username: 'tester' }
        })
    }));
    await page.route('**/character', route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
            skinColor: '#f5c5a3', hairStyle: 'ponytail', hairColor: '#7c3aed',
            eyeColor: '#2563eb', outfit: 'hoodie', outfitColor: '#1e1b4b',
            accessory: 'none', ultimateSkill: 'FRIDAY_DEPLOY'
        })
    }));

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('domcontentloaded');

    const playBtn = page.getByText(/PLAY/i);
    await expect(playBtn).toBeVisible({ timeout: 15000 });
    await playBtn.click();

    const emailInput = page.locator('input[placeholder*="codefighters.com"]');
    await emailInput.fill('test@example.com');
    await page.fill('input[placeholder="••••••••"]', '123456');
    await page.click('button:has-text("ENTRAR")');

    await page.waitForSelector('text="// ESTABLECIENDO CONEXIÓN NEURAL..."', { 
        state: 'detached', 
        timeout: 15000 
    });
    
    await expect(page.getByText('CHARACTER EDITOR')).toBeVisible();
    await page.getByRole('button', { name: /CONTINUAR/i }).click();

    await page.getByRole('button', { name: /INICIALIZAR COMBATE/i }).click();

    await page.locator('text=SOLO').click({ force: true });

    const gameCanvas = page.locator('#game-container canvas');
    await expect(gameCanvas).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(2000); 
    await expect(async () => {
        const busExists = await page.evaluate(() => {
            if (window.__EventBus) {
                window.__EventBus.emit('player-health', { hp: 20, maxHP: 100 });
                return true;
            }
            return false;
        });
        if (!busExists) {
            throw new Error("El EventBus aún no está en window");
        }
        await expect(page.locator('span:has-text("20/100")')).toBeVisible({ timeout: 2000 });
    }).toPass({ 
        timeout: 15000,
        intervals: [1000]
    });
})