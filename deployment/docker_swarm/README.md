GovTool Mainnet Swarm Deployment
================================

This directory contains Docker Swarm stack manifests intended to be deployed with
`mesudip/docker-stack`.

## Setup

1. Copy `.env.example` to `.env` and fill in the environment-specific values.
2. Make sure Docker Swarm is initialized on the target cluster.
3. Ensure the target node has the `mainnet=true` swarm label if you want these services 
   scheduled there. Use command `docker node update NODE_NAME --label-add mainnet=true`

## Deploy

```sh
docker-stack deploy govtool ./docker-compose-govtool.yml
docker-stack deploy proposal ./docker-compose-proposal.yml
docker-stack deploy outcomes ./docker-compose-outcomes.yml
```

## Remove

```sh
docker stack rm outcomes
docker stack rm proposal
docker stack rm govtool
```

## Notes

- `docker-stack` renders `x-template-file` entries using the variables from `.env`.
- The proposal stack now runs a single internal Postgres service. The old extra
  "replica" service has been removed.
