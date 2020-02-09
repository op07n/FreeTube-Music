![FreeTube Music Banner](images/banner.png)

# FreeTube Music
Like YouTube Music, but not a scam.
## What is FreeTube Music?
FreeTube Music is a completely free music-streaming service with no ads, millions of songs, and the classic FreeTube interface style. It allows you to import songs and albums, and unlike YouTube Music, you can play them in the background for free!
### How does FreeTube Music work?
FreeTube Music gets its music straight from YouTube using their [iframe API](https://developers.google.com/youtube/iframe_api_reference). The frame is hidden and the buttons are bound to iframe controls, allowing a seamless experience. However, one drawback of this is no control over video/audio quality.
### How do I install it?
Open up the Repl.it build in your mobile web browser (Safari for iOS or Chrome for Android) and add it to your home screen. As a web app, it should just install and work perfectly.
### How do I import songs/albums?
1. Find the song/album you want on YouTube and copy its link. Ideally, for albums, you want YouTube-generated music playlists, such as [this one](https://www.youtube.com/playlist?list=OLAK5uy_n0pnz1aCczxQ28LG8PqxAXCpRbXGLu_tM). They appear at the top of search results if you search for them by name and artist name, and to copy the link you select the album, press share, and press copy link.
2. Press the three lines in the top right of FreeTube Music.
3. Select "Import from Clipboard" and allow clipboard access if you need to. If your browser does not support Javascript clipboard access, press "Import from Link" and paste the link there.
4. FreeTube Music will detect whether the link refers to a song or an album. If it's a song, it will just appear in your library. If it's an album, you'll need to enter the album name and artist name as [oEmbed](https://oembed.com/) doesn't support playlists.
5. Tap on the song or album to play it!

## Comparison with YouTube Music
| Feature | FT Music | YT Music |
| --- | --- | --- |
| Listen to millions of songs completely free | ✅ | ✅ |
| No ads, ever | ✅ | 💵 |
| Listen with the screen off | ✅ | 💵 |
| Listen whilst using other apps | ✅ | 💵 |
| Open-source | ✅ | ❌ |
| Download songs for offline playback | ❌ | 💵 |
| Search/discover feature | ❌ | ✅ |

<sub><i>Key: ✅ = Always, ❌ = Never, 💵 = Only with YouTube Music Premium (£9.99/month)</i><sub>

As you can see, FreeTube Music provides most of YouTube Music's paid features for completely free. However, it is yet to support downloading or searching. Downloading will never be supported as it is prohibited by YouTube's terms, and searching requires a YouTube API key which I want to avoid.

## Where can I get it?
FreeTube Music is hosted on Repl.it. Ideally, I would host it on GitHub Pages but, for some reason, that won't work.

- [Repl.it](https://FreeTube-Music.cooltomato.repl.co)
- ~~[GitHub Pages](http://w-henderson.github.io/FreeTube-Music)~~ (doesn't work for some reason)