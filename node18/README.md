# Chiselled Node.js 18 LTS

This directory contains the image recipes of Chiselled Node.js 18 LTS. These images are smaller in size,
hence less prone to vulnerabilities. Know more about chisel [here](https://github.com/canonical/chisel).

We currently have Chiselled Node.js only on lunar. See [Dockerfile.23.04](./Dockerfile.23.04).

### Building the image(s)

Build the Dockerfile(s) in the usual way:

```sh
# NOTE: export DOCKER_BUILDKIT=1 if you're running on an older Docker version
$ docker build -t ubuntu/chiselled-node:18 --load -f node18/Dockerfile.23.04 node18
```

### Run the image(s)

The image has the "node" binary as the entrypoint.

```sh
$ docker run -it ubuntu/chiselled-node:18
Welcome to Node.js v18.13.0.
Type ".help" for more information.
...
```

### Building and running an application on Chiselled Node.js

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
