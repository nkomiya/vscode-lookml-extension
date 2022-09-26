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
  return path.join(OUT, path.relative(ROOT, file)).replace(/yaml$/, "json");
}

function onChange(file) {
  const output = getOutput(file);
  if (output == undefined || lock[output]) return;
  lock[output] = true;

  fs.mkdirSync(path.dirname(output), { recursive: true });
  if (/json$/.test(file)) {
    fs.copyFileSync(file, output);
  } else {
    try {
      const data = JSON.stringify(yaml.load(fs.readFileSync(file, "utf-8")));
      fs.writeFileSync(output, data);
      console.log(`${output} is updated`);
    } catch (e) {
      console.error("failed to parse yaml.");
    }
  }

  lock[output] = false;
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
