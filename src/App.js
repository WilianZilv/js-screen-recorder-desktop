import React from "react";
import * as recorder from "./lib/recorder";
const { remote } = window.require("electron");
const processCapture = remote.require("./processCapture");
const { getFrame } = remote.require("./app");

let videoRecorder;
let microphoneRecorder;
function App() {
    const [processing, setProcessing] = React.useState(false);
    const [recording, setRecording] = React.useState(false);
    const [crop, setCrop] = React.useState(false);
    const [desktopAudio, setDesktopAudio] = React.useState(true);
    const [micAudio, setMicAudio] = React.useState(true);

    const record = React.useCallback(async () => {
        if (videoRecorder || microphoneRecorder) return;
        videoRecorder = await recorder.createVideoRecorder(desktopAudio);
        if (micAudio) {
            microphoneRecorder = await recorder.createAudioRecorder();
            microphoneRecorder.start();
        }
        videoRecorder.start();
        setRecording(true);
    }, [desktopAudio, micAudio]);

    const stop = React.useCallback(async () => {
        const final = { crop };
        const finish = (stream, type) => {
            console.log("finish", type);
            final[type] = stream;

            if (microphoneRecorder) {
                if (!final.audio) return;
            } else {
                if (!final.video) return;
            }
            if (!final.video) return;
            videoRecorder = undefined;
            microphoneRecorder = undefined;
            setProcessing(true);
            processCapture(final).finally(() => setProcessing(false));
        };
        videoRecorder.onBuffer = (buffer) => {
            finish(buffer, "video");
        };
        if (microphoneRecorder) {
            microphoneRecorder.onBuffer = (buffer) => {
                finish(buffer, "audio");
            };
        }

        videoRecorder.stop();
        if (microphoneRecorder) microphoneRecorder.stop();

        setRecording(false);
    }, [crop]);

    const toggleCrop = () => setCrop((state) => !state);

    React.useEffect(() => {
        const frame = getFrame();
        if (crop) {
            frame.show();
        } else {
            frame.hide();
        }
    }, [crop, recording]);

    if (processing) return <>processando...</>;
    return (
        <>
            <div className="button" onClick={recording ? stop : record}>
                {recording ? "{}" : ">"}
            </div>

            {!recording && (
                <div className="button" onClick={toggleCrop}>
                    {crop ? "[ ]" : "[x]"}
                </div>
            )}
        </>
    );
}

export default App;
