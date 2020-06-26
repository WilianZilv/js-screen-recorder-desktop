export const getVideoStream = (desktopAudio = false) => {
    const audio = desktopAudio
        ? {
              mandatory: {
                  chromeMediaSource: "desktop",
              },
          }
        : false;
    return navigator.mediaDevices.getUserMedia({
        audio,
        video: {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: "screen:0:0",
            },
        },
    });
};

export const getMicrophoneStream = () =>
    navigator.mediaDevices.getUserMedia({
        audio: true,
    });
