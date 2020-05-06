---
layout: docs
title: Runner.video Method
permalink: /documentation/reference/testcafe-api/runner/video.html
---
# Runner.video Method

Enables TestCafe to record videos of test runs.

```text
video(path [, options, encodingOptions]) → this
```

Parameter                | Type                        | Description
------------------------ | --------------------------- | -----------
`path`                   | String                      | The base directory where videos are saved. Relative paths to video files are composed according to [path patterns](../../../guides/advanced-guides/screenshots-and-videos.md#default-path-pattern). You can also use the `options.pathPattern` property to specify a custom pattern.
`options`&#160;*(optional)* | Object | Options that define how videos are recorded. See [Basic Video Options](../../../guides/advanced-guides/screenshots-and-videos.md#basic-video-options) for a list of options.
`encodingOptions`&#160;*(optional)* | Object | Options that specify video encoding. You can pass all the options supported by the FFmpeg library. Refer to [the FFmpeg documentation](https://ffmpeg.org/ffmpeg.html#Options) for information about the available options.

See [Record Videos](../../../guides/advanced-guides/screenshots-and-videos.md#record-videos) for details.

*Related configuration file properties*:

* [videoPath](../../configuration-file.md#videopath)
* [videoOptions](../../configuration-file.md#videooptions)
* [videoEncodingOptions](../../configuration-file.md#videoencodingoptions)

**Example**

```js
runner.video('reports/videos/', {
    singleFile: true,
    failedOnly: true,
    pathPattern: '${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4'
}, {
    r: 20,
    aspect: '4:3'
});
```
