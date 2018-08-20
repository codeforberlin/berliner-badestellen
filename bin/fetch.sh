#!/bin/bash
cd public/data
mv all.json all.json-
wget https://www.berlin.de/lageso/gesundheit/gesundheitsschutz/badegewaesser/liste-der-badestellen/index.php/index/all.json?q= -O all.json