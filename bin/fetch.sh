#!/bin/bash
cd public/data
mv all.json all.json-
wget http://www.berlin.de/badegewaesser/baden-details/index.php/index/all.json?q= -O all.json