/* cloudvideo resolver
 * @lscofield
 * GNU
 */

const cheerio = require('cheerio');
const youtubedl = require('youtube-dl');

exports.index = function (req, res) {
    const source = 'source' in req.body ? req.body.source : req.query.source;
    const mode = 'mode' in req.body ? req.body.mode : req.query.mode;
    const html = Buffer.from(source, 'base64').toString('utf8');
    var mp4 = null;

    if (mode == 'remote') {
        const options = [];
        mp4 = '';
        youtubedl.getInfo(html, options, function (err, info) {
            if (err) {
                res.json({ status: 'error', url: '' });
            } else {
                if ('entries' in info)
                    info = info.entries[0];
                else info = info;

                mp4 = 'url' in info ? info.url : '';
                res.json({ status: mp4 == '' ? 'error' : 'ok', url: mp4 });
            }
        });
    } else {
        const $ = cheerio.load(html);

        try {
            mp4 = $('#vjsplayer').children().first().attr('src');

            if (mp4 == null || (!mp4.includes("v.mp4") && !mp4.includes(".m3u8"))) {
                mp4 = null;
            }
            if (mp4 != null && mp4.includes(".m3u8")) {
                var parts = mp4.split(',');
                mp4 = '';
                for (var i = 0; i < parts.length - 1; i++) {
                    mp4 += parts[i];
                }
                mp4 = mp4.replace('hls/', '') + '/v.mp4';
            }
        } catch (e) {
            mp4 = null;
        }

        mp4 = mp4 == null ? '' : mp4;

        res.json({ status: mp4 == '' ? 'error' : 'ok', url: mp4 });
    }
};