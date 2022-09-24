const glob = require("glob");
const yaml = require("js-yaml");
const fs = require("fs");

function compile(dirname) {
  glob(`${dirname}/*.yaml`, (e, files) => {
    if (e) throw e;
    files.forEach((f) => {
      const data = JSON.stringify(yaml.load(fs.readFileSync(f, "utf-8")));
      const out = f.replace(/yaml$/, "json");
      fs.writeFileSync(out, data);
    });
  });
}

compile("lookml");
