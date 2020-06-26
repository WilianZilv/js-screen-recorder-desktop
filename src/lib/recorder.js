import MediaStreamRecorder from "msr";
import * as userMedia from "./userMedia";

class Recorder {
    constructor(stream, mimeType) {
        this.onBuffer = () => {};
        this.recorder = new MediaStreamRecorder(stream);
        this.recorder.mimeType = mimeType;

        this.recorder.ondataavailable = (data) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                this.onBuffer(Buffer.from(reader.result));
            };
            reader.readAsArrayBuffer(data);
        };
    }
    start() {
        this.recorder.start();
    }
    stop() {
        this.recorder.stop();
    }
}
export const createAudioRecorder = async () => {
    const stream = await userMedia.getMicrophoneStream();
    return new Recorder(stream, "audio/ogg");
};
export const createVideoRecorder = async (desktopAudio) => {
    const stream = await userMedia.getVideoStream(desktopAudio);
    return new Recorder(stream, "video/webm");
};
