// Compile-only check of the public type definitions (run with `npm run typecheck`).
import WynnSDK, { WynnSDK as Named, WynnApiError } from 'wynnsdk';
import type { PlayerData, AspectData } from 'wynnsdk';

async function check() {
    const sdk = new WynnSDK();
    const withToken = new WynnSDK('token', { timeout: 5000 });
    const withOptions = new Named({ token: 'token', debug: true });

    const count: number = await sdk.quest.getQuestCount();
    const aspects: AspectData[] = await withToken.aspect.getAspectList('mage');
    const player: PlayerData = await withOptions.player.getPlayer('Salted');
    await sdk.guild.getGuild('Forgotten Library', 'uuid');
    sdk.clearCache();

    try {
        await sdk.player.getPlayer('x');
    } catch (e) {
        if (e instanceof WynnApiError) {
            const status: number | null = e.status;
        }
    }
    return { count, aspects, player };
}
check;
