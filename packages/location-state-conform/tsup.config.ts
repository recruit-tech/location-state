import { defineConfig } from "tsup";

export default defineConfig({
  target: "es2020",
  format: ["cjs", "esm"],
  clean: true,
  // CI上ではdts生成より先にbuildが進んでしまうため、以下のissue解消後有効化
  // https://github.com/egoist/tsup/issues/921
  dts: false,
});
