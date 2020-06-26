const { app } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-jetpack");
const ffmpeg = require("ffmpeg-static");
const { getFrame } = require("./app");
const tmpPath = path.join(app.getPath("userData"), "tmp");
const directory = path.join(app.getPath("documents"), "Electron Records");
fs.dir(directory);
fs.dir(tmpPath);

function ffmpegAsync(...args) {
    return new Promise((res, rej) => {
        const command = `${ffmpeg} ${args.join(" ")}`;
        exec(
            command,
            { cwd: tmpPath, shell: true },
            (error, stdout, stderr) => {
                console.log(command);
                console.log(String(stdout), String(stderr));
                if (error) return rej(error);
                res(String(stdout));
            }
        );
    });
}

module.exports = async function ({ video, audio, crop }) {
    const vf = [];
    if (crop) {
        const frame = getFrame();
        frame.show();
        const bounds = frame.getBounds();
        vf.push("-vf");
        vf.push(
            `crop=${bounds.width}:${bounds.height}:${bounds.x}:${bounds.y}`
        );
    }

    const name = Date.now().toString();

    const videoFinal = name + ".mp4";
    const videoTmp = name + ".webm";

    video = Buffer.from(video);
    await fs.writeAsync(path.join(tmpPath, videoTmp), video);

    if (audio) {
        const audio0Tmp = name + ".mp3";
        const audio1Tmp = name + ".a1";
        audio = Buffer.from(audio);
        await fs.writeAsync(path.join(tmpPath, audio1Tmp), audio);

        await ffmpegAsync("-i", videoTmp, audio0Tmp);

        await ffmpegAsync(
            "-i",
            videoTmp,
            "-i",
            audio0Tmp,
            "-i",
            audio1Tmp,
            "-filter_complex",
            '"[1][2]amix=inputs=2[a]"',
            "-map 0:v",
            '-map "[a]"',
            ...vf,
            videoFinal
        );
        fs.moveAsync(
            path.join(tmpPath, videoFinal),
            path.join(directory, videoFinal)
        );

        fs.removeAsync(path.join(tmpPath, audio0Tmp));
        fs.removeAsync(path.join(tmpPath, audio1Tmp));
    } else {
        ffmpegAsync("-i", videoTmp, ...vf, audio0Tmp);
    }
    fs.removeAsync(path.join(tmpPath, videoTmp));
    console.log("finished");
};
