# tno-eats

## Development setup

### Starting docker containers

This starts both containers, ganache and the truffle container.

```bash
docker-compose up -d
```

### Attaching to the container

You can attach to any of the containers. To detach run `exit`, however this also stops the container (can just restart it with `docker-compose up -d` again).

```bash
# Attach to the truffle container
docker exec -ti tno_eats bash
```

Then you can run any truffle commands in the truffle container.

```bash
truffle compile
```

### Cleanup/Misc

```bash
# To stop docker-compose
docker-compose down
```

```bash
# if modifying Dockerfile, rebuild image
docker-compose build
```
