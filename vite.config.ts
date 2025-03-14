import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import { type ConfigEnv, defineConfig, loadEnv } from "vite";


declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}


export default defineConfig(({ mode }: ConfigEnv) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  return defineConfig({
    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_lazyRouteDiscovery: true,
          v3_singleFetch: true,
          v3_routeConfig: true,
        },
      }),
      tsconfigPaths(),
    ],
  })
})

