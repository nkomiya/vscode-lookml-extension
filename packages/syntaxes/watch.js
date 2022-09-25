const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const ROOT = __dirname;
const OUT = path.join(ROOT, "../../dist/syntaxes");
let lock = {};

function getOutput(file) {
  const basename = path.basename(file);
  const isJson = /\.json$/.test(basename);
  if (isJson && basename !== "config.json") {
    return;
  }

  const lang = path.basename(path.dirname(path.resolve(file)));
  const outDir = path.join(OUT, lang);
  return path.join(outDir, basename.replace(/yaml$/, "json"));
}

function onChange(file) {
  const output = getOutput(file);
  if (output == undefined || lock[output]) return;
  lock[output] = true;
  if (/json$/.test(output)) {
    fs.copyFileSync(file, output);
  } else {
    const data = JSON.stringify(yaml.load(fs.readFileSync(file, "utf-8")));
    fs.writeFileSync(output, data);
  }
  lock[output] = false;

  console.log(`${output} is updated`);
}

function onUnlink(file) {
  const output = getOutput(file);
  if (output == undefined || lock[output]) return;
  lock[output] = true;
  fs.unlinkSync(output);
  lock[output] = true;

  console.log(`${output} is removed`);
}

const watcher = chokidar.watch(path.join(ROOT, "lookml"), {
  persistent: true,
});

watcher
  // change
  .on("change", onChange)
  // remove
  .on("unlink", onUnlink);
