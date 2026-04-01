GovTool Test Infrastructure
====================

Compose files and templates to deploy the GovTool test environment with `docker-stack`.
This also deploys the supporting services required for integration tests.

## Compose files and services
1. [basic-services](./docker-compose-basic-services.yml) : gateway and test-infrastructure postgres
2. [cardano](./docker-compose-cardano.yml) : node, dbsync and kuber
3. [govtool](./docker-compose-govtool.yml) : govtool-frontend and govtool-backend
4. [govaction-loader](./docker-compose-govaction-loader.yml) : govaction-loader frontend and backend
5. [test](./docker-compose-test.yml) : lighthouse-server and metadata-api
6. [proposal](./docker-compose-proposal.yml) : govtool proposal pillar backend from GHCR with its own Postgres
7. [outcomes](./docker-compose-outcomes.yml) : govtool outcomes pillar backend from GHCR using db-sync Postgres

## Setting up the services

### 1. Update `.env` and DNS records

- From this directory, create `.env` by copying `.env.example` and update it.
- `REGISTRY_HOST` is the registry host or registry root used for built application images.
  Images are published under the fixed `govtool/...` path.
  Examples: `docker.io`, `ghcr.io/intersectmbo`, `registry.sireto.io`.
- `POSTGRES_PASSWORD` is only for the lightweight test-infrastructure postgres used by
  Lighthouse and related support services.
- `DBSYNC_POSTGRES_HOST`, `DBSYNC_POSTGRES_PORT`, `DBSYNC_POSTGRES_USER`,
  `DBSYNC_POSTGRES_PASSWORD`, and `DBSYNC_DATABASE` are for the separate postgres used by
  `cardano-db-sync`, the GovTool backend, and the outcomes pillar backend.
- `proposal` manages its own Postgres service internally. Only the `PROPOSAL_*` secrets and
  database credentials need to be set; no external proposal database needs to be provisioned.
- The old bootstrap script is gone; `docker-stack` now renders structured secrets/configs
  directly from templates in this directory, while one-line secrets are inlined with
  `x-content` in the compose files.
- Make sure that DNS is pointed to the right server. Following are the domains used.
  - lighthouse-{BASE_DOMAIN}
  - kuber-{BASE_DOMAIN}
  - metadata-{BASE_DOMAIN}
  - governance-{BASE_DOMAIN}
  - pdf-{BASE_DOMAIN}
  - outcomes-{BASE_DOMAIN}

### 2. Prepare the machine
- Provision a server.
- Install `docker`
- Run `docker swarm init`, if docker swarm is not enabled
- Install `docker-stack` from PyPI in your local Python environment before running any deploy commands.

```sh
python3 -m  install docker-stack --break-system-packages
docker-stack --help
```

### 3. Label the swarm nodes
- On a single-node swarm, apply all required labels to that node:

```sh
NODE_ID="$(docker node ls --format '{{.ID}}')"
docker node update \
  --label-add govtool-test-stack=true \
  --label-add blockchain=true \
  --label-add gateway=true \
  --label-add govtool=true \
  --label-add gov-action-loader=true \
  "$NODE_ID"
```

### 4. Build images
- The backend base image still needs to be built once before building the GovTool backend image:

```sh
docker build -t govtool/backend-base:latest \
  -f ../../govtool/backend/Dockerfile.base \
  ../../govtool/backend
```

- Build the remaining application images:

```sh
docker compose -f ./docker-compose-govtool.yml build
docker compose -f ./docker-compose-govaction-loader.yml build
docker compose -f ./docker-compose-test.yml build
```

- `proposal` and `outcomes` use published GHCR images directly. They do not need local builds.
- `proposal` still deploys an internal Postgres service and volume, but it does not build images.

### 5. Deploy the stacks

#### Deploy (include node+dbsync)
- Use this when this environment should also run `cardano-node`, `cardano-db-sync`, and `kuber`.
- `basic-services` still deploys only the test-infrastructure postgres.
- `cardano-db-sync` writes to the separate postgres configured by the `DBSYNC_*` variables.
  That postgres is expected to be provisioned and tuned separately because db-sync is write-heavy.
- `outcomes` connects to that same db-sync postgres through `DBSYNC_*`.
- `proposal` runs its own Postgres inside the proposal stack.

```sh
docker-stack deploy basic-services ./docker-compose-basic-services.yml
docker-stack deploy cardano ./docker-compose-cardano.yml
docker-stack deploy govaction-loader ./docker-compose-govaction-loader.yml
docker-stack deploy govtool ./docker-compose-govtool.yml
docker-stack deploy proposal ./docker-compose-proposal.yml
docker-stack deploy outcomes ./docker-compose-outcomes.yml
docker-stack deploy test ./docker-compose-test.yml
```

#### Deploy (external dbsync)
- Use this when `cardano-node`, `cardano-db-sync`, and optionally `kuber` are already managed outside
  this directory.
- Point `DBSYNC_*` at the external db-sync postgres before deploying.
- `outcomes` will use those same `DBSYNC_*` values.
- If Gov Action Loader should use an external `kuber`, set `KUBER_API_URL_*` to that endpoint.
- In this mode, do not deploy the local `cardano` stack.
- `proposal` still remains self-contained because its Postgres is part of the proposal stack.

```sh
docker-stack deploy basic-services ./docker-compose-basic-services.yml
docker-stack deploy govaction-loader ./docker-compose-govaction-loader.yml
docker-stack deploy govtool ./docker-compose-govtool.yml
docker-stack deploy proposal ./docker-compose-proposal.yml
docker-stack deploy outcomes ./docker-compose-outcomes.yml
docker-stack deploy test ./docker-compose-test.yml
```

### 6. Remove the stacks

```sh
docker stack rm test
docker stack rm outcomes
docker stack rm proposal
docker stack rm govtool
docker stack rm govaction-loader
docker stack rm cardano
docker stack rm basic-services
```
