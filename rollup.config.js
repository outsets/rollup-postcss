import path from "path";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import livereload from "rollup-plugin-livereload";
import copy from "rollup-plugin-copy";

const production = !process.env.ROLLUP_WATCH;
const cssBundle = path.resolve(__dirname, "dist/style/bundle.css");
const useHash = false;
export default {
  input: "style/main.js",
  output: {
    file: "dist/style/bundle.js",
    format: "iife", // immediately-invoked function expression — suitable for <script> tags
    sourcemap: false
  },
  plugins: [
    resolve(), // tells Rollup how to find date-fns in node_modules
    commonjs(), // converts date-fns to ES modules
    postcss({
      extract: cssBundle,
      to: cssBundle,
      plugins: [
        require("postcss-url")([
          {
            filter: "style/iconfont/**/*",
            url: "copy",
            assetsPath: "iconfont",
            useHash
          },
          {
            filter: "style/images/**/*",
            url: "copy",
            assetsPath: "images",
            useHash
          }
        ])
      ]
    }),

    copy({
      targets: [
        { src: "assets/**/*", dest: "dist/assets" },
        { src: "lib/**/*", dest: "dist/lib" },
        { src: "page/**/*", dest: "dist" }
      ]
    }),
    !production && serve(),
    !production && livereload("dist"),
    production && terser() // minify, but only in production
  ],

  watch: {
    clearScreen: false
  }
};

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    }
  };
}
