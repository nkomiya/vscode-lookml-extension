const fs = require("fs");
const glob = require("glob");
const path = require("path");
const yaml = require("js-yaml");

const OUT = path.join(__dirname, "../../dist/syntaxes");

function compile(dirname) {
  const outDir = path.join(OUT, dirname);
  fs.mkdirSync(outDir, { recursive: true });

  fs.copyFileSync(
    path.join(__dirname, dirname, "config.json"),
    path.join(outDir, "config.json")
  );

  glob(`${dirname}/*.yaml`, (e, files) => {
    if (e) throw e;
    files.forEach((f) => {
      const data = JSON.stringify(yaml.load(fs.readFileSync(f, "utf-8")));
      const out = path.join(outDir, path.basename(f).replace(/yaml$/, "json"));
      fs.writeFileSync(out, data);
    });
  });
}

compile("lookml");
