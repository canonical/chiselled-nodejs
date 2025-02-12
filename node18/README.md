# Chiselled Node.js 18 LTS

This directory contains the image recipes of Chiselled Node.js 18 LTS. These images are smaller in size,
hence less prone to vulnerabilities. Know more about chisel [here](https://github.com/canonical/chisel).

We currently have Chiselled Node.js only on noble. See [Dockerfile.24.04](./Dockerfile.24.04).

### Building the image(s)

Build the Dockerfile(s) in the usual way:

```sh
$ rockcraft pack
```

Convert the rock to a Docker image using the `skopeo` tool:

```sh
$ skopeo --insecure-policy copy \
      oci-archive:nodejs_18_amd64.rock \
      docker-daemon:ubuntu/chiselled-node:18
```

### Run the image(s)

The image has the "node" binary as the entrypoint.

```sh
$ docker run -it ubuntu/chiselled-node:18 exec node
Welcome to Node.js v18.19.1.
Type ".help" for more information.
...
```

### Building and running an application on Chiselled Node.js

#### Simple One-File Application

Let's assume, you have the following `app.js` you want to run as an application.

```js
console.log("Hello World");
```

You may create the following Dockerfile for your application image:

```Dockerfile
FROM ubuntu/chiselled-node:18

ADD app.js /

ENTRYPOINT ["node", "app.js"]
```

Build the image:

```sh
$ docker build -t myapp -f Dockerfile.app .
```

Run your application container:

```sh
$ docker run myapp
Hello World
```

#### Multi-File Application

If you have a JavaScript/TypeScript application managed using `npm`, `yarn`, `pnpm` or some other package manager,
you might want to bundle your application using a bundler that bundles your `node_modules` and your
application into one single file.

There are a lot of different bundlers that may be suitable for your application, like [`esbuild`](https://esbuild.github.io/), [`rspack`](https://www.rspack.dev/),
[`vite`](https://vitejs.dev/), [`rollup`](https://rollupjs.org/), [`farm`](https://farm-fe.github.io/), [`webpack`](https://webpack.js.org/), [`parcel`](https://parceljs.org/) and so forth.
You might want to pick one that suit your project best and use that to bundle your application.

Do note that bundlers may break your application in unexpected ways
(due to tree-shaking and identifier minification), so please do test the bundled application thoroughly.

For the purposes of this tutorial, we will use `esbuild` with a simple TypeScript project.

Let's assume you have a project with the entry point like this:

```ts
import dayjs from "dayjs";

async function test_temporal() {
  return dayjs().format("YYYY-MM-DD");
}

console.log(await test_temporal());
```

And your `package.json` might look like this:

```json
{
    "name": "test-app",
    "version": "1.0.0",
    "main": "index.js",
    "license": "MIT",
    "scripts": {
        "build": "esbuild --target=node18 --bundle --minify --platform=node main.ts --outfile=dist/index.js",
        "check": "tsc -p tsconfig.json --noEmit"
    },
    "dependencies": {
        "dayjs": "^1",
    },
    "devDependencies": {
        "@tsconfig/node18": "^18",
        "esbuild": "^0.19",
        "typescript": "^5"
    }
}
```

Note that we added two scripts for convenience.

Now we can create a multi-stage Dockerfile that builds the application in a full-featured container
and then deploy the built application into the chiselled container.

```dockerfile
# build application in a full-featured container
FROM node:18 AS build

COPY . .
RUN npm ci && npm run check && npm run build

# chiselled container
FROM ubuntu/chiselled-node:18 AS final

COPY --from=build dist/index.js /index.js

ENTRYPOINT ["node", "index.js"]
```

Build the image:

```sh
$ docker build -t myapp -f Dockerfile.app .
```

Run your application container:

```sh
$ docker run myapp
2023-09-25
```

If your application contains Node.js native extensions, you should copy those extensions to the chiselled container as well.
If you are unsure if your application has those extensions, run the following command after populating `node_modules`:

```sh
find node_modules -name '*.node' -type f -print
```

If nothing got printed out, then it means your application does not have any native extensions.
If you got any output, then you need to copy those files to the container with the same path as well,
for instance:

If you got `node_modules/@serialport/bindings-cpp/prebuilds/linux-x64/node.napi.glibc.node` in the output,
and copied your JavaScript file to `/app/index.js`, you need to copy the native extension file to
`/app/node_modules/@serialport/bindings-cpp/prebuilds/linux-x64/node.napi.glibc.node`.

If your application contains WebAssembly bits, you should also copy those to the chiselled container.
Use the following command to find them:

```sh
find node_modules -name '*.wasm' -type f -print
```

You can take a look at [tests/app_simple-wasm](../tests/app_simple-wasm/) for inspirations.
