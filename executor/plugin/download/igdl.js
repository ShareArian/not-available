const fetch = require('node-fetch');

module.exports = {
    type: 'download',
    command: ['igdl', 'ig'],
    operate: async (context) => {
        const { q, tdx, m, xreply, reaction, crtImg, crtVid } = context;

        if (!q) {
            await xreply('Masukkan URL Instagram. Contoh: *!igdl https://www.instagram.com/p/C9C0ry2pZn8/*');
            await reaction(m.chat, '❗');
            return;
        }

        try {
            await reaction(m.chat, '⬇️');
            let pler = await fetch(`https://widipe.com/download/igdl?url=${q}`);
            let { result: biji } = await pler.json();

            if (!biji.length) {
                await xreply('Tidak ada media yang ditemukan.');
                await reaction(m.chat, '❌');
                return;
            }

            let setH = new Set()
            let images = [];
            let videos = [];

            for (let item of biji) {
                if (setH.has(item.url)) continue;
                setH.add(item.url);
                let file = await tdx.getFile(item.url, true);
                if (file.mime === "image/jpeg") {
                    images.push(item.url);
                } else if (file.mime === "video/mp4") {
                    videos.push(item.url);
                }
            }

            for (let i = 0; i < images.length; i += 10) {
                let imageCards = [];
                for (let j = i; j < Math.min(i + 10, images.length); j++) {
                    let media = await crtImg(images[j]);
                    imageCards.push({
                        body: { text: `Image ${j + 1}` },
                        footer: { text: "© TdX Client - #TrashDex" },
                        header: { hasMediaAttachment: true, imageMessage: media },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"Source","url":"${images[j]}","merchant_url":"${images[j]}"}`
                            }]
                        }
                    });
                }

                await tdx.relayMessage(m.chat, {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: {
                                body: { text: "Results from IG slide" },
                                footer: { text: "© TdX Client - #TrashDex" },
                                carouselMessage: { cards: imageCards }
                            }
                        }
                    }
                }, {});
            }

            for (let url of videos) {
                await tdx.sendMessage(m.chat, {
                    video: { url },
                    caption: '© TdX Client - #TrashDex'
                }, { quoted: m });
            }

            await reaction(m.chat, '✅');
        } catch (error) {
            console.error('Error:', error);
            await xreply('Gagal mendownload media dari Instagram. Silakan coba lagi nanti.');
            await reaction(m.chat, '❌');
        }
    }
};