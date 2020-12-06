#!/usr/bin/env bash

npm run build
rm -rf dist && python setup.py sdist
