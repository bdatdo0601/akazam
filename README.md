# Akazam

[![Coverage Status](https://coveralls.io/repos/github/bdatdo0601/akazam/badge.svg?branch=master)](https://coveralls.io/github/bdatdo0601/akazam?branch=master)
[![Build Status](https://travis-ci.org/bdatdo0601/akazam.svg?branch=master)](https://travis-ci.org/bdatdo0601/akazam)
[![dependencies Status](https://david-dm.org/bdatdo0601/akazam/status.svg)](https://david-dm.org/bdatdo0601/akazam)
[![devDependencies Status](https://david-dm.org/bdatdo0601/akazam/dev-status.svg)](https://david-dm.org/bdatdo0601/akazam?type=dev)
[![Inline docs](http://inch-ci.org/github/bdatdo0601/akazam.svg?branch=master)](http://inch-ci.org/github/bdatdo0601/akazam)

Informational Database for Personal Life

# Pre-requirement

-   [Node](https://nodejs.org/en/) (> v8.0.0) **NOTE: Untested with v10.0.0**
-   [Yarn Package Manager](https://yarnpkg.com/en/)
-   [MongoDB](https://www.mongodb.com/) (`brew install mongodb`)
    -   MacOSX 10.12
    -   XCode 8.3.2

# Installation

1. Install all dependencies with `yarn` command
2. Configure environment variable (`.env`) to specify necessary key/URI, sample-env is provided

# Usage

### Commands

<!-- -   `yarn init-db`: initialize the local database (**NOTE: all data in local database will be loss once executed**) -->

-   `yarn start`: start the development version (with development variables) of the API
-   `yarn start-watch`: start development version with nodemon, will auto restart on file changes
-   `yarn test`: Unit testing the API
-   `yarn coveralls`: Run unit test and send result over to [coveralls.io](https://coveralls.io/)
-   `yarn start-production`: start the production version of the API
-   `yarn clean`: clean up build folder, use when you want to create a fresh production version of the project
-   `yarn build-server`: build a production version of the project
-   `yarn build`: Combination of `yarn clean` and `yarn build-server`
